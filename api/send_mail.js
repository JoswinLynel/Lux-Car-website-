import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
    }

    try {
        const EMAIL_USER = process.env.EMAIL_USER;
        const EMAIL_PASS = process.env.EMAIL_PASS;

        if (!EMAIL_USER || !EMAIL_PASS) {
            console.error("Missing email credentials in Vercel environment variables.");
            return res.status(500).json({ status: 'error', message: 'Server configuration error. Please set EMAIL_USER and EMAIL_PASS in Vercel environment variables.' });
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.ionos.co.uk',
            port: 465,
            secure: true,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            }
        });

        const data = req.body;
        const formType = data.formType || 'contact';

        if (formType === 'contact') {
            await handleContactForm(transporter, EMAIL_USER, data);
        } else if (formType === 'booking') {
            await handleBookingForm(transporter, EMAIL_USER, data);
        }

        return res.status(200).json({ status: 'success', message: 'Message sent successfully!' });

    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ status: 'error', message: 'Failed to send message', details: error.message });
    }
}

// ─── Helper: build an HTML table row ───
function row(label, value) {
    return `<tr>
        <td style="padding:10px 16px;font-weight:bold;border:1px solid #e0e0e0;width:35%;background:#fff;">${label}</td>
        <td style="padding:10px 16px;border:1px solid #e0e0e0;background:#fff;">${value || ''}</td>
    </tr>`;
}

function sectionHeader(title) {
    return `<tr><td colspan="2" style="padding:12px 16px;font-weight:bold;font-size:15px;background:#f0f0f0;border:1px solid #e0e0e0;">${title}</td></tr>`;
}

// ═══════════════════════════════════════
//  CONTACT FORM
// ═══════════════════════════════════════
async function handleContactForm(transporter, EMAIL_USER, data) {
    const customerName = data.name || 'Website Visitor';
    const customerEmail = data.email || '';
    const customerPhone = data.phone || '';
    const customerMessage = data.message || '';

    // ── Email to GS Executive (Admin) ──
    const adminHTML = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#222;max-width:650px;">
        <p>Hello GS Executive Transfers,</p>
        <p>A new contact enquiry has been submitted through your website. Here are the details:</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            ${sectionHeader('Contact Details')}
            ${row('From:', customerName)}
            ${row('Email:', `<a href="mailto:${customerEmail}">${customerEmail}</a>`)}
            ${row('Phone:', customerPhone)}
            ${sectionHeader('Message')}
            <tr><td colspan="2" style="padding:14px 16px;border:1px solid #e0e0e0;background:#fff;">${customerMessage}</td></tr>
        </table>
        <p style="color:#666;font-size:13px;">This is an automated notification from GS Executive Transfers (<a href="https://gsexecutivetransfers.co.uk">https://gsexecutivetransfers.co.uk</a>).</p>
        <p>Thank you,<br>GS Executive Transfers Team</p>
    </div>`;

    await transporter.sendMail({
        from: `"GS Executive Transfers" <${EMAIL_USER}>`,
        to: EMAIL_USER,
        replyTo: customerEmail,
        subject: `New Contact Enquiry from ${customerName}`,
        html: adminHTML
    });

    // ── Confirmation Email to Customer ──
    if (customerEmail) {
        const customerHTML = `
        <div style="font-family:Arial,Helvetica,sans-serif;color:#222;max-width:650px;">
            <p>Dear ${customerName},</p>
            <p>Thank you for contacting <strong>GS Executive Transfers</strong>. We have received your message and will get back to you as soon as possible, usually within 1 business day.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                ${sectionHeader('Your Message')}
                <tr><td colspan="2" style="padding:14px 16px;border:1px solid #e0e0e0;background:#fff;">${customerMessage}</td></tr>
            </table>
            <p>If your enquiry is urgent, please feel free to call us directly at <strong>01793-272521</strong> or WhatsApp us at <strong>+44 7471 571269</strong>.</p>
            <p style="color:#666;font-size:13px;">This is an automated confirmation from GS Executive Transfers (<a href="https://gsexecutivetransfers.co.uk">https://gsexecutivetransfers.co.uk</a>).</p>
            <p>Thank you,<br>GS Executive Transfers Team</p>
        </div>`;

        await transporter.sendMail({
            from: `"GS Executive Transfers" <${EMAIL_USER}>`,
            to: customerEmail,
            subject: 'Thank you for contacting GS Executive Transfers',
            html: customerHTML
        });
    }
}

// ═══════════════════════════════════════
//  BOOKING FORM
// ═══════════════════════════════════════
async function handleBookingForm(transporter, EMAIL_USER, data) {
    const passengerName = data.passengerName || 'Website User';
    const customerEmail = data.emailAddr || '';
    const phoneNumber = data.phoneNumber || '';
    const pickupLoc = data.pickupLoc || '';
    const journeyDate = data.journeyDate || '';
    const journeyTime = data.journeyTime || '';
    const destinationLoc = data.destinationLoc || '';
    const vehType = data.vehType || '';
    const numPassengers = data.numPassengers || '';
    const smallSuitcases = data.smallSuitcases || '0';
    const largeSuitcases = data.largeSuitcases || '0';
    const flightNumber = data.flightNumber || '';
    const landingTime = data.landingTime || '';
    const requireReturn = data.requireReturn === 'true' ? 'Yes' : 'No';
    const returnPickup = data.returnPickup || '';
    const returnDateVal = data.returnDateVal || '';
    const returnTime = data.returnTime || '';
    const returnFlight = data.returnFlight || '';
    const paymentType = data.paymentType || '';
    const additionalInfo = data.additionalInfo || '';

    // Map vehicle codes to readable names
    const vehicleNames = {
        'e-class': 'Executive Car (Mercedes E-Class or better)',
        'estate': 'Executive Estate',
        'vito': 'Executive 7/8 Seater (Mercedes Vito)',
        's-class': 'Mercedes S Class'
    };
    const vehicleDisplay = vehicleNames[vehType] || vehType;

    // ── Build the booking table ──
    const bookingTable = `
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        ${sectionHeader('Passenger Details')}
        ${row('From:', passengerName)}
        ${row('Email:', `<a href="mailto:${customerEmail}">${customerEmail}</a>`)}
        ${row('Phone:', `${phoneNumber}`)}

        ${sectionHeader('Journey Information')}
        ${row('Pickup Location:', pickupLoc)}
        ${row('Pickup Date:', journeyDate)}
        ${row('Pickup Time:', journeyTime)}
        ${row('Destination:', destinationLoc)}

        ${sectionHeader('Vehicle Details')}
        ${row('Vehicle Type:', vehicleDisplay)}
        ${row('Passengers:', numPassengers)}
        ${row('Small Suitcases:', smallSuitcases)}
        ${row('Large Suitcases:', largeSuitcases)}

        ${sectionHeader('Flight Information')}
        ${row('Flight/Ship Number:', flightNumber || 'N/A')}
        ${row('Arrival Time:', landingTime || '')}

        ${sectionHeader('Payment & Additional Info')}
        ${row('Payment Method:', paymentType ? paymentType.charAt(0).toUpperCase() + paymentType.slice(1) : '')}
        ${row('Return Journey:', requireReturn)}
        ${row('Return Pickup:', returnPickup)}
        ${row('Return Date:', returnDateVal)}
        ${row('Return Time:', returnTime)}
        ${row('Return Flight Number:', returnFlight)}
        ${row('Message:', additionalInfo)}
    </table>`;

    // ── Email to GS Executive (Admin) ──
    const adminHTML = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#222;max-width:650px;">
        <p>Hello GS Executive Transfers,</p>
        <p>A new booking request has been submitted through your website. Here are the details:</p>
        ${bookingTable}
        <p style="color:#666;font-size:13px;">This is an automated notification from GS Executive Transfers (<a href="https://gsexecutivetransfers.co.uk">https://gsexecutivetransfers.co.uk</a>).</p>
        <p>Thank you,<br>GS Executive Transfers Team</p>
    </div>`;

    await transporter.sendMail({
        from: `"GS Executive Transfers" <${EMAIL_USER}>`,
        to: EMAIL_USER,
        replyTo: customerEmail,
        subject: `New Booking Request from ${passengerName}`,
        html: adminHTML
    });

    // ── Confirmation Email to Customer ──
    if (customerEmail) {
        const customerHTML = `
        <div style="font-family:Arial,Helvetica,sans-serif;color:#222;max-width:650px;">
            <p>Dear ${passengerName},</p>
            <p>Thank you for your booking request with <strong>GS Executive Transfers</strong>. We have received your details and will confirm your journey shortly.</p>
            <p>Here is a summary of your booking request:</p>
            ${bookingTable}
            <p>We will be in touch to confirm your booking. If you need to make any changes, please call us at <strong>01793-272521</strong> or WhatsApp us at <strong>+44 7471 571269</strong>.</p>
            <p style="color:#666;font-size:13px;">This is an automated confirmation from GS Executive Transfers (<a href="https://gsexecutivetransfers.co.uk">https://gsexecutivetransfers.co.uk</a>).</p>
            <p>Thank you,<br>GS Executive Transfers Team</p>
        </div>`;

        await transporter.sendMail({
            from: `"GS Executive Transfers" <${EMAIL_USER}>`,
            to: customerEmail,
            subject: 'Your Booking Request – GS Executive Transfers',
            html: customerHTML
        });
    }
}
