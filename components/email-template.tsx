import * as React from 'react';
import Image from 'next/image';

interface EmailTemplateProps {
  imageURl: string;
}

interface ContactEmailTemplateProps {
  name: string;
  email: string;
  message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  imageURl
}) => (
  <div>
    <h1>Here is your image</h1>
    <div style={{ position: 'relative', width: '100%', height: '300px' }}>
      <Image 
        src={imageURl} 
        alt="Generated image"
        fill
        style={{ objectFit: 'contain' }}
        priority
      />
    </div>
  </div>
);

export const ContactEmailTemplate: React.FC<Readonly<ContactEmailTemplateProps>> = ({
  name,
  email,
  message
}) => (
  <div style={{ 
    fontFamily: 'Arial, sans-serif', 
    maxWidth: '600px', 
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  }}>
    <div style={{
      backgroundColor: '#ffffff',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ 
        color: '#1f2937', 
        fontSize: '24px',
        marginBottom: '20px',
        borderBottom: '3px solid #3b82f6',
        paddingBottom: '10px'
      }}>
        🩺 New Contact Form Submission - Healix
      </h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '14px',
          marginBottom: '20px'
        }}>
          You have received a new message from the Healix contact form.
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#f3f4f6',
        padding: '20px',
        borderRadius: '6px',
        marginBottom: '15px'
      }}>
        <h3 style={{ 
          color: '#374151',
          fontSize: '16px',
          marginBottom: '8px',
          fontWeight: 'bold'
        }}>
          👤 Name:
        </h3>
        <p style={{ 
          color: '#1f2937',
          fontSize: '16px',
          margin: '0'
        }}>
          {name}
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#f3f4f6',
        padding: '20px',
        borderRadius: '6px',
        marginBottom: '15px'
      }}>
        <h3 style={{ 
          color: '#374151',
          fontSize: '16px',
          marginBottom: '8px',
          fontWeight: 'bold'
        }}>
          📧 Email:
        </h3>
        <p style={{ 
          color: '#1f2937',
          fontSize: '16px',
          margin: '0'
        }}>
          <a href={`mailto:${email}`} style={{ 
            color: '#3b82f6',
            textDecoration: 'none'
          }}>
            {email}
          </a>
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#f3f4f6',
        padding: '20px',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3 style={{ 
          color: '#374151',
          fontSize: '16px',
          marginBottom: '8px',
          fontWeight: 'bold'
        }}>
          💬 Message:
        </h3>
        <p style={{ 
          color: '#1f2937',
          fontSize: '16px',
          margin: '0',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.6'
        }}>
          {message}
        </p>
      </div>

      <div style={{
        borderTop: '1px solid #e5e7eb',
        paddingTop: '20px',
        marginTop: '20px'
      }}>
        <p style={{ 
          color: '#9ca3af',
          fontSize: '12px',
          margin: '0',
          textAlign: 'center'
        }}>
          This email was sent from the Healix contact form.<br />
          Please respond to {email} to continue the conversation.
        </p>
      </div>
    </div>
  </div>
);
