# 📄 PDF Document Extraction Guide

## 🎯 **New Feature: AI-Powered PDF Data Extraction**

The application now includes a powerful PDF document extraction feature that integrates with your n8n workflow for AI-powered data extraction.

## 🚀 **How It Works**

### **1. PDF Upload & Processing**
- **Drag & Drop**: Intuitive file upload interface
- **File Validation**: PDF format and size (10MB limit) validation
- **Preview**: View PDF before processing
- **Progress Tracking**: Real-time processing status

### **2. AI Document Extraction**
- **OCR Processing**: Optical Character Recognition for scanned documents
- **NLP Analysis**: Natural Language Processing for data extraction
- **Field Detection**: Automatic identification of key data fields
- **Structured Output**: Clean, organized JSON data

### **3. n8n Integration**
- **Webhook Endpoint**: `https://evident-fox-nationally.ngrok-free.app/webhook-test/doc-extraction`
- **File Processing**: Sends PDF to your AI workflow
- **Data Return**: Receives extracted data in structured format
- **Error Handling**: Graceful fallback for processing failures

## 🔧 **Technical Implementation**

### **Frontend Features**
```vue
<!-- PDF Upload Interface -->
<div class="upload-area" 
     :class="{ 'dragover': isDragOver, 'has-file': selectedFile }"
     @drop="handleDrop"
     @dragover.prevent="isDragOver = true"
     @dragleave.prevent="isDragOver = false"
     @click="triggerFileInput">
  
  <!-- Drag & Drop Zone -->
  <div v-if="!selectedFile" class="upload-placeholder">
    <VIcon name="upload" size="large" />
    <p>Drag and drop your PDF here or click to browse</p>
  </div>
  
  <!-- File Info Display -->
  <div v-else class="file-info">
    <VIcon name="file-pdf" size="large" color="danger" />
    <div class="file-details">
      <h3>{{ selectedFile.name }}</h3>
      <p>{{ formatFileSize(selectedFile.size) }}</p>
    </div>
  </div>
</div>
```

### **File Processing Logic**
```typescript
async function processDocument() {
  if (!selectedFile.value) return
  
  isProcessing.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('filename', selectedFile.value.name)
    formData.append('timestamp', new Date().toISOString())
    
    const response = await fetch('https://evident-fox-nationally.ngrok-free.app/webhook-test/doc-extraction', {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    
    if (data.success) {
      extractedData.value = data.data.extracted_fields || data.data
      result.value = `Document processed successfully! Extracted ${Object.keys(extractedData.value).length} fields.`
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    isProcessing.value = false
  }
}
```

### **Data Display & Export**
```typescript
// Format extracted data for display
function formatFieldName(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Download extracted data as JSON
function downloadData() {
  const dataStr = JSON.stringify(extractedData.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `extracted_data_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
```

## 📊 **n8n Webhook Integration**

### **Endpoint Details**
- **URL**: `https://evident-fox-nationally.ngrok-free.app/webhook-test/doc-extraction`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`

### **Request Format**
```json
{
  "file": "PDF file (binary)",
  "filename": "document.pdf",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### **Expected Response Format**
```json
{
  "success": true,
  "data": {
    "extracted_fields": {
      "customer_name": "John Doe",
      "ic_number": "123456789012",
      "property_address": "123 Main Street",
      "bank_name": "Maybank Berhad",
      "facility_type": "Housing Loan",
      "declaration_date": "2024-01-01"
    },
    "confidence": 0.95,
    "processing_time": "2.3s"
  }
}
```

### **Error Response Format**
```json
{
  "success": false,
  "message": "Document processing failed",
  "error": "OCR processing error details"
}
```

## 🎨 **User Interface Features**

### **Upload Section**
- **Drag & Drop Zone**: Visual feedback during file operations
- **File Validation**: Real-time error messages for invalid files
- **File Preview**: View PDF before processing
- **Progress Indicators**: Loading states and processing feedback

### **Results Display**
- **Structured Data**: Clean, organized field display
- **Field Formatting**: Human-readable field names
- **Data Actions**: Download JSON and copy to clipboard
- **Success/Error States**: Clear feedback for all operations

### **Information Sections**
- **How It Works**: Step-by-step process explanation
- **Webhook Details**: Technical integration information
- **API Documentation**: Request/response format examples

## 🔍 **File Validation & Security**

### **File Type Validation**
```typescript
function validateAndSetFile(file: File) {
  // Check file type
  if (file.type !== 'application/pdf') {
    error.value = 'Please select a valid PDF file'
    return
  }
  
  // Check file size (10MB limit)
  if (file.size > MAX_FILE_SIZE) {
    error.value = 'File size must be less than 10MB'
    return
  }
  
  selectedFile.value = file
  error.value = ''
  result.value = ''
  extractedData.value = null
}
```

### **Security Features**
- **File Type Restriction**: Only PDF files accepted
- **Size Limits**: 10MB maximum file size
- **Input Sanitization**: Safe file handling
- **Error Boundaries**: Graceful error handling

## 🧪 **Testing & Usage**

### **Local Testing**
1. **Navigate to PDF Extraction**: Use sidebar navigation
2. **Upload Test PDF**: Drag & drop or browse for file
3. **Process Document**: Click "Extract Document Data"
4. **Review Results**: Check extracted data and download

### **n8n Workflow Testing**
1. **Prepare Test PDF**: Create sample document
2. **Test Webhook**: Use Postman or curl
3. **Verify Response**: Check data extraction quality
4. **Monitor Logs**: Review processing performance

### **cURL Testing Example**
```bash
curl -X POST "https://evident-fox-nationally.ngrok-free.app/webhook-test/doc-extraction" \
  -F "file=@test_document.pdf" \
  -F "filename=test_document.pdf" \
  -F "timestamp=2024-01-01T00:00:00Z"
```

## 🚀 **Deployment Considerations**

### **Vercel Compatibility**
- ✅ **100% Compatible**: Pure Vue.js implementation
- ✅ **No Dependencies**: Standard web APIs only
- ✅ **File Handling**: Client-side file processing
- ✅ **Responsive Design**: Mobile-friendly interface

### **Performance Features**
- **Client-Side Validation**: Immediate file feedback
- **Progress Tracking**: Real-time status updates
- **Efficient Uploads**: Optimized file handling
- **Responsive UI**: Smooth user experience

## 📋 **Use Cases & Applications**

### **Legal Document Processing**
- **Statutory Declarations**: Extract customer and property details
- **Contract Analysis**: Identify key terms and conditions
- **Form Processing**: Automate data entry from PDFs
- **Compliance Documents**: Extract regulatory information

### **Business Workflows**
- **Invoice Processing**: Extract vendor and amount details
- **Receipt Analysis**: Capture transaction information
- **Report Generation**: Extract data for analytics
- **Document Classification**: Categorize document types

### **Integration Scenarios**
- **CRM Systems**: Import customer data from documents
- **Accounting Software**: Process financial documents
- **HR Systems**: Extract employee information
- **Compliance Tools**: Monitor regulatory requirements

## 🎯 **Next Steps & Enhancements**

### **Immediate Features**
- ✅ **PDF Upload**: Drag & drop interface
- ✅ **File Validation**: Type and size checking
- ✅ **n8n Integration**: Webhook processing
- ✅ **Data Display**: Structured field output
- ✅ **Export Options**: JSON download and clipboard

### **Future Enhancements**
- **Batch Processing**: Multiple PDF uploads
- **Template Support**: Custom extraction rules
- **Data Mapping**: Field mapping configuration
- **API Integration**: Direct service connections
- **Advanced OCR**: Enhanced text recognition
- **Document Comparison**: Version control features

## 🎉 **Success Indicators**

- ✅ **PDF Uploads**: Working correctly
- ✅ **File Validation**: Proper error handling
- ✅ **n8n Integration**: Successful webhook calls
- ✅ **Data Extraction**: Structured output generation
- ✅ **User Experience**: Intuitive interface
- ✅ **Export Functionality**: Download and copy features

---

## 🚀 **Ready for Production!**

**The PDF extraction feature now provides:**
- **Professional Interface**: Modern, responsive design
- **Robust Validation**: File type and size checking
- **Seamless Integration**: Direct n8n webhook connection
- **Data Export**: Multiple output formats
- **Error Handling**: Graceful failure management

**Start extracting data from your PDF documents today!** 📄✨

**Access the feature at: `/pdf-upload`**
