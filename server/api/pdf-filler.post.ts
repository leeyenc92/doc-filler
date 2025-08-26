import { H3Event, readBody } from 'h3'
import puppeteer from 'puppeteer'

export default defineEventHandler(async (event: H3Event) => {
  interface Purchaser {
    name: string
    ic: string
  }
  interface FormData {
    purchasers: Purchaser[]
  }

  const body = await readBody(event);
  // Fallbacks for missing fields
  const firstPurchaser = Array.isArray(body.purchasers) && body.purchasers.length > 0 ? body.purchasers[0] : { name: '', ic: '' };
  const data = {
    NAME: firstPurchaser.name || '',
    NRIC: firstPurchaser.ic || '',
    ADDRESS: body.address || '',
    PROPERTY: body.property || '',
    BANK: body.bank || '',
    BANK_ADDRESS: body.bankAddress || '',
    BRANCH_ADDRESS: body.branchAddress || '',
    FACILITY: body.facility || '',
    DATE: body.date || '',
  };

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Statutory Declaration</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      margin: 60px 50px 60px 70px;
      color: #000;
    }
    .center {
      text-align: center;
    }
    .italic {
      font-style: italic;
    }
    .heading-main {
      font-size: 12pt;
      font-weight: bold;
      margin-bottom: 0;
      letter-spacing: 1px;
      text-decoration: underline;
    }
    .heading-sub {
      font-size: 12pt;
      margin-top: 0;
      margin-bottom: 30px;
      
    }
    .block {
      margin-bottom: 18px;
      text-align: justify;
      text-justify: inter-word;
    }
    .numbered {
      margin-bottom: 12px;
    }
    .final {
      margin-top: 24px;
    }
    .signature {
      margin-top: 40px;
      text-align: left;
    }
    .signature-line {
      display: inline-block;
      border-bottom: 1px dotted #000;
      width: 220px;
      height: 18px;
      margin-bottom: 2px;
    }
    .before-me {
      margin-top: 40px;
      text-align: center;
    }
    .page-break {
      page-break-before: always;
    }
    .small {
      font-size: 10pt;
    }
    .text-indent-60{    
      text-indent: 60px;
    }
    ol{
      padding-inline-start: 15px;
    }
    ol li::marker {
      content: counter(list-item) ")";
    }
  </style>
</head>
<body>
    <div class="center heading-main">STATUTORY DECLARATION</div>
    <div class="center heading-sub">[Residential Property for Owner Occupation]</div>
    <div class="block text-indent-60">
      I/We, <b>{{NAME}}</b> (NRIC NO. {{NRIC}}) of <b>{{ADDRESS}}</b> hereby solemnly and sincerely declare as follows:
    </div>
    <ol>
    <li class="block numbered">
      &nbsp;&nbsp;&nbsp;I/We declare that the Property of <b>{{PROPERTY}}</b> ("Property") shall be occupied by me/us throughout the tenor of the Facility;
    </li>
    <li class="block numbered">
      &nbsp;&nbsp;&nbsp;The Customer, <b>{{NAME}} (NRIC NO. {{NRIC}})</b> has applied for a Facility of {{FACILITY}} only ("Facility") and the Bank, <b>{{BANK}}</b>, a company incorporated in Malaysia and with its registered office at <b>{{BANK_ADDRESS}}</b> with a branch office at <b>{{BRANCH_ADDRESS}}</b> (“Financier”) has agreed to part finance the purchase of the Property by way of 1st/3rd Party Legal Charge; and
    </li>
    <li class="block numbered">
      &nbsp;&nbsp;&nbsp;I/We am/are fully aware that the declaration made herein is material to the Financier in its granting and/or allowing the utilization or disbursement of the Facility. I/We am/are also fully aware that if this declaration is tendered as evidence, I/We shall be liable to prosecution if I/We have willfully state anything herein which I/We know is false or do not believe in.
    </li>
    </ol>
    <div class="block final">
      And I/We make this solemn declaration conscientiously believing the same to be true and by virtue of the provisions of the Statutory Declarations Act, 1960.
    </div>
    <div class="" style="display:flex; align-items: flex-start;">
      <div class="block" style="width: 320px;">
        Subscribed and solemnly declared<br>
        by <b>{{NAME}}</b><br>
        at in the State of<br>
        this <b>{{DATE}}</b>
      </div>
      <div style="width: 10px;">
        )<br>
        )<br>
        )<br>
        )
      </div>
      <div class="signature" >
        <span class="signature-line" style="margin-top:20px;"></span><br>
        {{NAME}}<br>
        <span class="small">(NRIC NO. {{NRIC}})</span>
      </div>
    </div>
    <div class="before-me">
      Before me,
    </div>
    <div class="page-break"></div>
    <div class="center heading-main" style="margin-top:60px;">STATUTORY DECLARATION</div><br><br>
    <div class="block text-indent-60">
      I/We, <b>{{NAME}}</b> (NRIC NO. {{NRIC}}) of <b>{{ADDRESS}}</b> do hereby affirm and solemnly declare that date hereof, I/We am/are not an undischarged bankrupt and that no bankruptcy proceedings have been instituted against me/us under the laws of Malaysia or in anywhere else having jurisdiction over me/us and I/We do solemnly and sincerely declare that to the best of my/our knowledge there is no legal proceeding having been instituted against me/us nor any pending legal proceedings or intended legal proceedings to be brought against me/us.
    </div>
    <div class="block text-indent-60">
      I/We, make this declaration in full knowledge and awareness of your reliance on this declaration as an inducement or basis to grant/continue to grant the Facility /Facilities (as defined in the Letter of Offer) to me/us and/or to a third party for whom I/we shall be acting as Chargor and/or Guarantor and/or Assignor in your favour.
    </div>
    <div class="block text-indent-60">
      I/We am/are fully aware that it is a criminal offence to induce you to grant the Facility/Facilities on the basis of a false declaration.
    </div>
    <div class="block">
      I/We am/are also aware that the penal consequences for making a false declaration in respect of the above may include: -
      <br>
      <ol>
        <li>
        &nbsp;&nbsp;&nbsp;imprisonment for term not exceeding 3 years and shall also be liable to a fine pursuant to Section 193 of the Penal Code read together with section 199 of the Penal code; or   
        </li>
        <li>
        &nbsp;&nbsp;&nbsp;imprisonment for a term not less than 1 year and not exceeding 10 years and with whipping and shall also be liable to a fine pursuant to Section 420 of the Penal Code.   
        </li>
      </ol>
     </div>
    <div class="block final">
      And I/We make this solemn declaration conscientiously believing the same to be true and by virtue of the provisions of the Statutory Declarations Act, 1960.
    </div>
    <div class="" style="display:flex; align-items: flex-start;">
      <div class="block" style="width: 320px;">
        Subscribed and solemnly declared<br>
        by <b>{{NAME}}</b><br>
        at in the State of<br>
        this <b>{{DATE}}</b>
      </div>
      <div style="width: 10px;">
        )<br>
        )<br>
        )<br>
        )
      </div>
      <div class="signature" >
        <span class="signature-line" style="margin-top:20px;"></span><br>
        {{NAME}}<br>
        <span class="small">(NRIC NO. {{NRIC}})</span>
      </div>
    </div>
    <div class="before-me">
      Before me,
    </div>
</body>
</html>

`;
  // Replace placeholders with form data
  html = html.replace(/{{(\w+)}}/g, (_, key: string) => (data as Record<string, string>)[key] || '');

  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  event.node.res.setHeader('Content-Type', 'application/pdf');
  event.node.res.setHeader('Content-Disposition', 'attachment; filename="{{NAME}}-{LawFirmName}-SD.pdf"');
  return Buffer.from(pdfBuffer);
});
// --- PDF content for reference ---
/*
  const p1 = addPage();
  p1.drawCenteredHeading('STATUTORY DECLARATION', 14, 10);
  p1.drawCenteredHeading('[Residential Property for Owner Occupation]', 11, 18);

  p1.drawParagraph(
    'I/We, HUDA BINTI MUHAMMAD FIRDAUS (NRIC NO. 961124-56-5082) of NO  21  JALAN  SUAKASIH  3/6,   BANDAR  TUN  HUSSEIN ONN,   43200  BATU  9  CHERAS,   SELANGOR hereby solemnly and sincerely declare as follows:',
    { size: 11, firstLineIndent: 18 }
  );

  p1.space(2);
  p1.drawParagraph(
    '1) I/We declare that the Property of A unit of Double Storey Terrace House known as PT  49402, Setia Alamsari Fasa P2A held under Individual Title HSD 189221, PT  49402, Mukim Semenyih, Daerah Ulu Langat, Negeri Selangor (“Property”) shall be occupied by me/us throughout the tenor of the Facility;',
    { size: 11, firstLineIndent: 18 }
  );
  p1.drawParagraph(
    '2) The Customer, HUDA BINTI MUHAMMAD FIRDAUS (NRIC NO. 961124-56-5082) has applied for a Facility of Commodity Murabahah Home Financing-i of RM622,336.00 [inclusive of MRTT Contribution of RM18,868.00 and Legal Fees of RM3,168.00] only (“Facility”) and the Bank, MAYBANK ISLAMIC BERHAD [Registration No. 200701029411 (787435-M)], a company incorporated in Malaysia and with its registered office at 15th Floor, Tower A, Dataran Maybank, 1, Jalan Maarof, 59000 Kuala Lumpur with a branch office at 26, 28 & 30, Jalan Raja Hassan, Menara Klang, 41400 Klang, Selangor (“Financier”) has agreed to part finance the purchase of the Property by way of  1st/ 3rd Party Legal Charge; and',
    { size: 11, firstLineIndent: 18 }
  );
  p1.drawParagraph(
    '3) I/We am/are fully aware that the declaration made herein is material to the Financier in its granting and/or allowing the utilization or disbursement of the Facility. I/We am/are also fully aware that if this declaration is tendered as evidence, I/We shall be liable to prosecution if I/We have willfully state anything herein which I/We know is false or do not believe in.',
    { size: 11, firstLineIndent: 18 }
  );

  p1.space(6);
  p1.drawParagraph(
    'And I/We make this solemn declaration conscientiously believing the same to be true and by virtue of the provisions of the Statutory Declarations Act, 1960.',
    { size: 11, firstLineIndent: 18 }
  );

  p1.space(12);
  // Subscribed block (Purchaser 1)
  p1.drawParagraph('Subscribed and solemnly declared )', { size: 11 });
  p1.drawParagraph('by HUDA BINTI MUHAMMAD FIRDAUS  )', { size: 11 });
  p1.drawParagraph('at in the State of      )', { size: 11 });
  p1.drawParagraph('this     day of                                      )', { size: 11 });
  p1.space(12);

  // Signature line + printed name
  const sigY1 = p1.cursorY;
  p1.drawLine(sigY1, MARGIN_L + 260, PAGE_WIDTH - MARGIN_R);
  p1.cursorY -= 4;
  p1.drawParagraph('  HUDA BINTI MUHAMMAD FIRDAUS', { size: 11, left: MARGIN_L + 260 });
  p1.drawParagraph('  (NRIC NO. 961124-56-5082)', { size: 11, left: MARGIN_L + 260 });

  p1.space(18);

  // Subscribed block (Purchaser 2)
  p1.drawParagraph('Subscribed and solemnly declared )', { size: 11 });
  p1.drawParagraph('by Purchaser 2  )', { size: 11 });
  p1.drawParagraph('at in the State of      )', { size: 11 });
  p1.drawParagraph('this     day of                                      )', { size: 11 });
  p1.space(12);

  const sigY2 = p1.cursorY;
  p1.drawLine(sigY2, MARGIN_L + 260, PAGE_WIDTH - MARGIN_R);
  p1.cursorY -= 4;
  p1.drawParagraph('  Purchaser 2', { size: 11, left: MARGIN_L + 260 });
  p1.drawParagraph('  (NRIC NO. 961124-56-5082)', { size: 11, left: MARGIN_L + 260 });

  p1.space(24);
  p1.drawParagraph('Before me,', { size: 11 });
  p1.space(28);
  p1.drawLine(p1.cursorY, MARGIN_L + 120, PAGE_WIDTH - MARGIN_R); // Commissioner/Notary signature line

  // === PAGE 2 ===
  const p2 = addPage();
  p2.drawCenteredHeading('STATUTORY DECLARATION', 14, 18);

  p2.drawParagraph(
    'I/We, HUDA BINTI MUHAMMAD FIRDAUS (NRIC NO. 961124-56-5082) of NO  21  JALAN  SUAKASIH  3/6,  BANDAR  TUN  HUSSEIN ONN,  43200  BATU  9  CHERAS,  SELANGOR do hereby affirm and solemnly declare that date hereof, I/We am/are not an undischarged bankrupt and that no bankruptcy proceedings have been instituted against me/us under the laws of Malaysia or in anywhere else having jurisdiction over me/us and I/We do solemnly and sincerely declare that to the best of my/our knowledge there is no legal proceeding having been instituted against me/us nor any pending legal proceedings or intended legal proceedings to be brought against me/us.',
    { size: 11, firstLineIndent: 18 }
  );

  p2.drawParagraph(
    'I/We, make this declaration in full knowledge and awareness of your reliance on this declaration as an inducement or basis to grant/continue to grant the Facility /Facilities (as defined in the Letter of Offer dated 3rd day of August 2023) to me/us and/or to a third party for whom I/we shall be acting as Chargor and/or Guarantor and/or Assignor in your favour.',
    { size: 11, firstLineIndent: 18 }
  );

  p2.drawParagraph(
    'I/We am/are fully aware that it is a criminal offence to induce you to grant the Facility/Facilities on the basis of a false declaration.',
    { size: 11, firstLineIndent: 18 }
  );

  p2.drawParagraph(
    'I/We am/are also aware that the penal consequences for making a false declaration in respect of the above may include: -',
    { size: 11, firstLineIndent: 18 }
  );

  p2.drawParagraph(
    'a) imprisonment for term not exceeding 3 years and shall also be liable to a fine pursuant to Section 193 of the Penal Code read together with section 199 of the Penal code; or',
    { size: 11, firstLineIndent: 18 }
  );
  p2.drawParagraph(
    'b) imprisonment for a term not less than 1 year and not exceeding 10 years and with whipping and shall also be liable to a fine pursuant to Section 420 of the Penal Code.',
    { size: 11, firstLineIndent: 18 }
  );

  p2.space(6);
  p2.drawParagraph(
    'And I/We make this solemn declaration conscientiously believing the same to be true and by virtue of the provisions of the Statutory Declarations Act, 1960.',
    { size: 11, firstLineIndent: 18 }
  );

  p2.space(12);
  // Subscribed block page 2
  p2.drawParagraph('Subscribed and solemnly declared )', { size: 11 });
  p2.drawParagraph('by HUDA BINTI MUHAMMAD FIRDAUS )', { size: 11 });
  p2.drawParagraph('at in the State of      )', { size: 11 });
  p2.drawParagraph('this     day of                                      )', { size: 11 });
  p2.space(12);

  const sigY3 = p2.cursorY;
  p2.drawLine(sigY3, MARGIN_L + 260, PAGE_WIDTH - MARGIN_R);
  p2.cursorY -= 4;
  p2.drawParagraph('  HUDA BINTI MUHAMMAD FIRDAUS', { size: 11, left: MARGIN_L + 260 });
  p2.drawParagraph('  (NRIC NO. 961124-56-5082)', { size: 11, left: MARGIN_L + 260 });

  p2.space(24);
  p2.drawParagraph('Before me,', { size: 11 });
  p2.space(28);
  p2.drawLine(p2.cursorY, MARGIN_L + 120, PAGE_WIDTH - MARGIN_R);
*/
