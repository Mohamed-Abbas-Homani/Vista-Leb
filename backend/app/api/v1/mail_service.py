import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
import datetime
from app.core.db import db_dep

router = APIRouter(prefix="/mail", tags=["Mail"])


# --- SCHEMAS ---
class ContactUsRequest(BaseModel):
    name: str
    email: EmailStr
    message: str


class ContactUsResponse(BaseModel):
    message: str
    status: str
    contact_name: str


class EmailRequest(BaseModel):
    to_email: EmailStr
    subject: str
    message: str
    recipient_name: Optional[str] = None


class EmailResponse(BaseModel):
    message: str
    status: str


# --- EMAIL CONFIGURATION ---
class EmailConfig:
    def __init__(self):
        # Gmail SMTP settings (you can change these for other providers)
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = "ahmadmoussa780@gmail.com"
        self.sender_password = "tywk vpyj vwkt tzjr"  # Replace with the 16-character app password from Gmail

email_config = EmailConfig()


# --- HELPER FUNCTIONS ---
def create_contact_us_html_template(name: str, email: str, message: str) -> str:
    """Create beautiful HTML template for contact us emails - email client compatible"""
    html_template = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Message</title>
        <!--[if mso]>
        <noscript>
            <xml>
                <o:OfficeDocumentSettings>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml>
        </noscript>
        <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); background-color: #667eea; color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
                                <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">🚀 New Contact Message</h1>
                                <p style="margin: 0; font-size: 16px; opacity: 0.9;">Someone has reached out through your contact form</p>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <!-- Priority Badge -->
                                <div style="text-align: center; margin-bottom: 20px;">
                                    <span style="display: inline-block; background-color: #ff6b6b; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">⚡ NEW INQUIRY</span>
                                </div>
                                
                                <!-- Contact Info -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td width="50%" style="padding: 0 10px 20px 0; vertical-align: top;">
                                            <div style="background-color: #f5f7ff; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea;">
                                                <div style="font-weight: bold; color: #667eea; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">👤 FULL NAME</div>
                                                <div style="font-size: 16px; color: #333;">{name}</div>
                                            </div>
                                        </td>
                                        <td width="50%" style="padding: 0 0 20px 10px; vertical-align: top;">
                                            <div style="background-color: #f5f7ff; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea;">
                                                <div style="font-weight: bold; color: #667eea; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">📧 EMAIL ADDRESS</div>
                                                <div style="font-size: 16px; color: #333; word-break: break-all;">{email}</div>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Message -->
                                <div style="background-color: #f8f9ff; border-left: 5px solid #667eea; border-radius: 10px; padding: 25px; margin: 20px 0;">
                                    <div style="font-weight: bold; color: #667eea; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">💬 MESSAGE</div>
                                    <div style="background-color: white; padding: 20px; border-radius: 8px; font-size: 16px; line-height: 1.7; color: #555; border: 1px solid #eee; white-space: pre-wrap;">{message}</div>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8f9ff; padding: 30px; text-align: center; border-top: 1px solid #e1e8ff; border-radius: 0 0 10px 10px;">
                                <p style="margin: 0 0 10px 0; color: #667eea; font-size: 14px; font-weight: bold;">🎯 Action Required: Please review and respond to this inquiry</p>
                                <p style="margin: 0; color: #999; font-size: 12px; font-style: italic;">Received on {datetime.datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    return html_template


def create_contact_us_confirmation_html(name: str) -> str:
    """Create beautiful confirmation HTML template for the user - email client compatible"""
    html_template = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Message Received - Thank You!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); background-color: #00b894; color: white; padding: 50px 30px; text-align: center; border-radius: 10px 10px 0 0;">
                                <div style="width: 80px; height: 80px; border-radius: 50%; background-color: rgba(255, 255, 255, 0.2); margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px; line-height: 80px;">✓</div>
                                <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: bold;">Message Received!</h1>
                                <p style="margin: 0; font-size: 18px; opacity: 0.9;">We've got your message and we're excited to connect</p>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 50px 30px; text-align: center;">
                                <div style="font-size: 24px; color: #333; margin-bottom: 20px; font-weight: bold;">Hi {name}! 👋</div>
                                
                                <div style="font-size: 16px; color: #666; line-height: 1.8; margin-bottom: 30px;">
                                    Thank you for reaching out to us! We've successfully received your message and our team is already reviewing it. We appreciate you taking the time to contact us.
                                </div>
                                
                                <!-- Timeline -->
                                <div style="background-color: #f8f9ff; border-radius: 15px; padding: 30px; margin: 30px 0; border-left: 5px solid #667eea; text-align: left;">
                                    <h3 style="color: #667eea; font-size: 18px; margin: 0 0 15px 0; text-align: center;">🚀 What happens next?</h3>
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr><td style="padding: 8px 0; color: #555; position: relative; padding-left: 25px;">✓ Our team reviews your message carefully</td></tr>
                                        <tr><td style="padding: 8px 0; color: #555; position: relative; padding-left: 25px;">✓ We'll get back to you within 24-48 hours</td></tr>
                                        <tr><td style="padding: 8px 0; color: #555; position: relative; padding-left: 25px;">✓ You'll receive a personalized response via email</td></tr>
                                        <tr><td style="padding: 8px 0; color: #555; position: relative; padding-left: 25px;">✓ We'll work together to address your needs</td></tr>
                                    </table>
                                </div>
                                
                                <div style="font-size: 16px; color: #666; line-height: 1.8;">
                                    In the meantime, feel free to explore our website or follow us on social media for updates and insights. We're looking forward to speaking with you soon!
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8f9ff; padding: 40px 30px; border-top: 1px solid #e1e8ff; border-radius: 0 0 10px 10px; text-align: center;">
                                <div style="color: #667eea; font-size: 14px; margin-bottom: 20px;">
                                    <strong>Need immediate assistance?</strong><br>
                                    Email: support@yourcompany.com | Phone: (555) 123-4567
                                </div>
                                
                                <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
                                    This is an automated confirmation email. Please do not reply to this message.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    return html_template


def create_regular_email_html_template(recipient_name: str, content: str, subject: str) -> str:
    """Create a clean, professional HTML template for regular emails"""
    html_template = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px;">
                        <!-- Header -->
                        <tr>
                            <td style="background-color: #667eea; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                                <h1 style="margin: 0; font-size: 24px; font-weight: bold;">{subject}</h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                {"<div style='font-size: 18px; color: #333; margin-bottom: 20px; font-weight: 600;'>Hi " + recipient_name + "!</div>" if recipient_name else ""}
                                
                                <div style="font-size: 16px; color: #555; line-height: 1.6; white-space: pre-wrap;">{content}</div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8f9ff; padding: 25px 30px; border-top: 1px solid #e1e8ff; border-radius: 0 0 8px 8px; text-align: center;">
                                <p style="margin: 0; color: #666; font-size: 14px;">
                                    Best regards,<br>
                                    <strong>The Team</strong>
                                </p>
                                <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;">
                                    Sent on {datetime.datetime.now().strftime('%B %d, %Y at %I:%M %p')}
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    return html_template


def create_message(sender_email: str, recipient_email: str, subject: str, body: str, html_body: str = None) -> MIMEMultipart:
    """Create email message"""
    message = MIMEMultipart("alternative")
    message["From"] = sender_email
    message["To"] = recipient_email
    message["Subject"] = subject

    # Add plain text part
    text_part = MIMEText(body, "plain")
    message.attach(text_part)

    # Add HTML part if provided
    if html_body:
        html_part = MIMEText(html_body, "html")
        message.attach(html_part)

    return message


def send_email_smtp(message: MIMEMultipart, recipients: List[str]):
    """Send email using SMTP"""
    try:
        # Create SSL context
        context = ssl.create_default_context()
        
        # Connect to server and send email
        with smtplib.SMTP(email_config.smtp_server, email_config.smtp_port) as server:
            server.ehlo()
            server.starttls(context=context)
            server.ehlo()
            server.login(email_config.sender_email, email_config.sender_password)
            
            # Send email
            server.sendmail(email_config.sender_email, recipients, message.as_string())
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")


def send_regular_email(to_email: str, subject: str, message: str, recipient_name: str = None, use_html: bool = True) -> bool:
    """
    Reusable function to send regular emails with clean styling
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        message: Email content/message
        recipient_name: Optional recipient name for personalization
        use_html: Whether to use HTML template (default: True)
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Create plain text message
        plain_text = f"Hi {recipient_name}!\n\n{message}\n\nBest regards,\nThe Team" if recipient_name else f"{message}\n\nBest regards,\nThe Team"
        
        # Create HTML message if requested
        html_body = None
        if use_html:
            html_body = create_regular_email_html_template(
                recipient_name=recipient_name or "",
                content=message,
                subject=subject
            )
        
        # Create email message
        email_message = create_message(
            sender_email=email_config.sender_email,
            recipient_email=to_email,
            subject=subject,
            body=plain_text,
            html_body=html_body
        )
        
        # Send email
        send_email_smtp(message=email_message, recipients=[to_email])
        return True
        
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False


# --- ROUTES ---
@router.post("/contact-us", response_model=ContactUsResponse, status_code=status.HTTP_200_OK)
async def contact_us(contact_data: ContactUsRequest, db: db_dep):
    """Handle contact us form submissions with beautiful email templates"""
    try:
        # Create HTML email for the team (notification)
        team_html = create_contact_us_html_template(
            name=contact_data.name,
            email=contact_data.email,
            message=contact_data.message
        )
        
        # Create team notification email
        team_message = create_message(
            sender_email=email_config.sender_email,
            recipient_email=email_config.sender_email,  # Send to your email
            subject=f"🚀 New Contact Form Submission from {contact_data.name}",
            body=f"New contact message from {contact_data.name} ({contact_data.email}):\n\n{contact_data.message}",
            html_body=team_html
        )
        
        # Send notification to team
        send_email_smtp(message=team_message, recipients=[email_config.sender_email])
        
        # Create confirmation HTML for the user
        confirmation_html = create_contact_us_confirmation_html(contact_data.name)
        
        # Create confirmation email for the user
        user_message = create_message(
            sender_email=email_config.sender_email,
            recipient_email=contact_data.email,
            subject="✅ We've received your message - Thank you for contacting us!",
            body=f"Hi {contact_data.name},\n\nThank you for contacting us! We've received your message and our team will review it shortly. We'll get back to you within 24-48 hours.\n\nBest regards,\nThe Team",
            html_body=confirmation_html
        )
        
        # Send confirmation to user
        send_email_smtp(message=user_message, recipients=[contact_data.email])
        
        return ContactUsResponse(
            message="Thank you for contacting us! Your message has been sent successfully and our team will review it shortly.",
            status="success",
            contact_name=contact_data.name
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process contact form: {str(e)}")


@router.post("/send-email", response_model=EmailResponse, status_code=status.HTTP_200_OK)
async def send_email_endpoint(email_data: EmailRequest):
    """Send a regular email using the reusable email function"""
    try:
        success = send_regular_email(
            to_email=email_data.to_email,
            subject=email_data.subject,
            message=email_data.message,
            recipient_name=email_data.recipient_name,
            use_html=True
        )
        
        if success:
            return EmailResponse(
                message="Email sent successfully!",
                status="success"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to send email")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")


# Example usage of the reusable function in your code:
"""
# Send a welcome email
send_regular_email(
    to_email="user@example.com",
    subject="Welcome to Our Platform!",
    message="Thank you for joining us. We're excited to have you on board!",
    recipient_name="John Doe"
)

# Send a notification email
send_regular_email(
    to_email="admin@example.com",
    subject="System Alert",
    message="Your system backup completed successfully.",
    use_html=False  # Send plain text only
)

# Send without recipient name
send_regular_email(
    to_email="customer@example.com",
    subject="Order Confirmation",
    message="Your order #12345 has been confirmed and will be shipped soon."
)
"""