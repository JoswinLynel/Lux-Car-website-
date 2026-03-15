import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
    }

    try {
        // You'll need to configure these environment variables in your Vercel Dashboard
        // Settings -> Environment Variables
        const EMAIL_USER = process.env.EMAIL_USER; // e.g., 'info@gsexecutivetransfers.co.uk'
        const EMAIL_PASS = process.env.EMAIL_PASS; // Your IONOS email password

        if (!EMAIL_USER || !EMAIL_PASS) {
            console.error("Missing email credentials in Vercel environment variables.");
            return res.status(500).json({ status: 'error', message: 'Server configuration error' });
        }

        // Configure Nodemailer transporter for IONOS
        const transporter = nodemailer.createTransport({
            host: 'smtp.ionos.co.uk', // Standard IONOS SMTP server
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            }
        });

        const data = req.body;
        const formType = data.formType || 'contact';

        let subject = '';
        let email_content = '';
        let replyTo = '';

        if (formType === 'contact') {
            subject = `New Contact Enquiry from ${data.name || 'Website User'}`;
            replyTo = data.email || EMAIL_USER;

            email_content = `Name: ${data.name || 'Not provided'}\n`;
            email_content += `Email: ${data.email || 'Not provided'}\n`;
            email_content += `Phone: ${data.phone || 'Not provided'}\n\n`;
            email_content += `Message:\n${data.message || 'Not provided'}\n`;

        } else if (formType === 'booking') {
            subject = `New Booking Request from ${data.passengerName || 'Website User'}`;
            replyTo = data.emailAddr || EMAIL_USER;

            email_content = "New Booking Request:\n\n";
            email_content += "--- Passenger Details ---\n";
            email_content += `Name: ${data.passengerName || ''}\n`;
            email_content += `Phone: ${data.phoneNumber || ''}\n`;
            email_content += `Email: ${data.emailAddr || ''}\n\n`;
            
            email_content += "--- Outbound Journey ---\n";
            email_content += `Date: ${data.journeyDate || ''}\n`;
            email_content += `Time: ${data.journeyTime || ''}\n`;
            email_content += `Pickup: ${data.pickupLoc || ''}\n`;
            email_content += `Destination: ${data.destinationLoc || ''}\n\n`;
            
            email_content += "--- Vehicle & Luggage ---\n";
            email_content += `Vehicle Type: ${data.vehType || ''}\n`;
            email_content += `Passengers: ${data.numPassengers || ''}\n`;
            email_content += `Small Suitcases: ${data.smallSuitcases || ''}\n`;
            email_content += `Large Suitcases: ${data.largeSuitcases || ''}\n\n`;
            
            if (data.flightNumber) {
                email_content += "--- Flight Information ---\n";
                email_content += `Flight Number: ${data.flightNumber}\n`;
                email_content += `Landing Time: ${data.landingTime || ''}\n\n`;
            }
            
            email_content += "--- Return Journey ---\n";
            email_content += `Required: ${data.requireReturn === 'true' ? 'Yes' : 'No'}\n`;
            if (data.requireReturn === 'true') {
                email_content += `Return Pickup: ${data.returnPickup || ''}\n`;
                email_content += `Return Date: ${data.returnDateVal || ''}\n`;
                email_content += `Return Time: ${data.returnTime || ''}\n`;
                email_content += `Return Flight: ${data.returnFlight || ''}\n\n`;
            } else {
                email_content += "\n";
            }
            
            email_content += "--- Payment & Additional Info ---\n";
            email_content += `Payment Method: ${data.paymentType || ''}\n`;
            email_content += `Additional Info: ${data.additionalInfo || ''}\n`;
        }

        // Send the email
        const info = await transporter.sendMail({
            from: `"GS Executive Transfers" <${EMAIL_USER}>`,
            to: EMAIL_USER, // Sending to yourself
            replyTo: replyTo,
            subject: subject,
            text: email_content
        });

        console.log("Message sent: %s", info.messageId);
        return res.status(200).json({ status: 'success', message: 'Message sent successfully!' });

    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ status: 'error', message: 'Failed to send message', details: error.message });
    }
}
