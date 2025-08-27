# Webhook Integration with n8n

This document explains how to integrate the Legal Document Filler with n8n using the webhook endpoint.

## Webhook Endpoint

**URL:** `POST /api/webhook`

**Base URL:** `https://your-domain.com/api/webhook` (replace with your actual domain)

## Supported Data Formats

The webhook accepts data in multiple formats to be flexible with different n8n configurations:

### Format 1: Direct Field Mapping
```json
{
  "name": "John Doe",
  "ic": "123456789012",
  "address": "123 Main Street, Kuala Lumpur",
  "property": "Apartment 15A, Tower 1, City Center",
  "bank": "Maybank Berhad",
  "bankAddress": "100 Jalan Tun Perak, 50050 Kuala Lumpur",
  "branchAddress": "15 Jalan Bukit Bintang, 55100 Kuala Lumpur",
  "facility": "Housing Loan",
  "date": "2024-01-15"
}
```

### Format 2: Nested Structure
```json
{
  "purchaser": {
    "name": "John Doe",
    "ic": "123456789012"
  },
  "customerAddress": "123 Main Street, Kuala Lumpur",
  "propertyDetails": "Apartment 15A, Tower 1, City Center",
  "bankName": "Maybank Berhad",
  "bankRegisteredAddress": "100 Jalan Tun Perak, 50050 Kuala Lumpur",
  "branchOfficeAddress": "15 Jalan Bukit Bintang, 55100 Kuala Lumpur",
  "facilityType": "Housing Loan",
  "declarationDate": "2024-01-15"
}
```

### Format 3: Multiple Purchasers
```json
{
  "purchasers": [
    {
      "name": "John Doe",
      "ic": "123456789012"
    },
    {
      "name": "Jane Doe",
      "ic": "987654321098"
    }
  ],
  "address": "123 Main Street, Kuala Lumpur",
  "property": "Apartment 15A, Tower 1, City Center",
  "bank": "Maybank Berhad",
  "bankAddress": "100 Jalan Tun Perak, 50050 Kuala Lumpur",
  "branchAddress": "15 Jalan Bukit Bintang, 55100 Kuala Lumpur",
  "facility": "Housing Loan",
  "date": "2024-01-15"
}
```

## Field Mapping Reference

| Webhook Field | Alternative Names | Description | Required |
|---------------|-------------------|-------------|----------|
| `name` | `purchaserName`, `customerName` | Purchaser's full name | Yes |
| `ic` | `nric`, `icNumber`, `customerIc` | NRIC/IC number | Yes |
| `address` | `customerAddress` | Customer's address | Yes |
| `property` | `propertyDetails`, `propertyAddress` | Property details/address | Yes |
| `bank` | `bankName` | Bank name | Yes |
| `bankAddress` | `bankRegisteredAddress` | Bank's registered address | Yes |
| `branchAddress` | `branchOfficeAddress` | Branch office address | Yes |
| `facility` | `facilityType`, `loanType` | Type of facility/loan | Yes |
| `date` | `declarationDate` | Declaration date (YYYY-MM-DD) | Yes |

## n8n Configuration

### 1. HTTP Request Node

Configure an HTTP Request node in n8n with the following settings:

- **Method:** POST
- **URL:** `https://your-domain.com/api/webhook`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body:** JSON (use the data from your workflow)

### 2. Example n8n Workflow

Here's a simple example of how to structure your n8n workflow:

1. **Trigger Node** (e.g., Webhook, Schedule, or Manual)
2. **Set Node** - Prepare your data
3. **HTTP Request Node** - Send to the webhook
4. **File Operations Node** - Save the returned PDF

### 3. Data Preparation in n8n

Use a "Set" node to prepare your data before sending to the webhook:

```javascript
// Example Set node configuration
{
  "name": "{{ $json.customerName }}",
  "ic": "{{ $json.customerIc }}",
  "address": "{{ $json.customerAddress }}",
  "property": "{{ $json.propertyDetails }}",
  "bank": "{{ $json.bankName }}",
  "bankAddress": "{{ $json.bankRegisteredAddress }}",
  "branchAddress": "{{ $json.branchOfficeAddress }}",
  "facility": "{{ $json.loanType }}",
  "date": "{{ $json.declarationDate }}"
}
```

## Response

The webhook response varies based on the deployment environment:

### Local Development
- **Content-Type:** `application/pdf`
- **Filename:** `{CustomerName}_SD_Webhook.pdf`
- **Content:** Generated Statutory Declaration PDF

### Vercel Deployment
- **Content-Type:** `text/html`
- **Headers:** 
  - `X-Environment: Vercel`
  - `X-PDF-Available: false`
- **Content:** HTML content with Vercel deployment notice
- **Note:** PDF generation is not available on Vercel due to serverless limitations

## Error Handling

The webhook provides detailed error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "statusMessage": "Missing required fields: name, ic, address",
  "data": null
}
```

### 405 Method Not Allowed
```json
{
  "statusCode": 405,
  "statusMessage": "Method Not Allowed",
  "data": null
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "statusMessage": "Internal Server Error",
  "data": {
    "message": "An error occurred while processing the webhook",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Testing the Webhook

You can test the webhook using curl:

```bash
curl -X POST https://your-domain.com/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "ic": "123456789012",
    "address": "123 Test Street",
    "property": "Test Property",
    "bank": "Test Bank",
    "bankAddress": "123 Bank Street",
    "branchAddress": "456 Branch Street",
    "facility": "Test Loan",
    "date": "2024-01-15"
  }' \
  --output test_document.pdf
```

## Security Considerations

- The webhook is publicly accessible by default
- Consider implementing authentication if needed (e.g., API keys, JWT tokens)
- Monitor webhook usage and implement rate limiting if necessary
- Log all webhook requests for audit purposes

## Vercel Deployment

### Hybrid Approach
This webhook uses a hybrid approach that automatically detects the deployment environment:

- **Local Development:** Full PDF generation using Puppeteer
- **Vercel:** HTML output with deployment guidance

### Vercel Limitations
- No Puppeteer/Chromium support in serverless functions
- 10-second execution timeout
- Read-only file system
- Memory limitations

### Vercel Alternatives
For PDF generation on Vercel, consider:
1. **External PDF Services:** Puppeteer Cloud, Browserless
2. **Client-side Conversion:** jsPDF, html2pdf.js
3. **Edge Runtime:** Compatible PDF libraries
4. **API Routes:** Call external PDF generation services

## Troubleshooting

### Common Issues

1. **Missing Required Fields:** Ensure all required fields are provided
2. **Invalid Date Format:** Use YYYY-MM-DD format for dates
3. **Special Characters:** The system handles special characters in names automatically
4. **PDF Generation Errors:** Check server logs for Puppeteer/Chromium issues

### Debug Mode

The webhook logs all incoming requests to the console. Check your server logs to see the exact data being received.

## Support

If you encounter issues with the webhook integration, check:

1. Server logs for error messages
2. n8n workflow execution logs
3. Network connectivity between n8n and your server
4. Data format compliance with the expected schema
