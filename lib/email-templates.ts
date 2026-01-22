// Email templates for OTP authentication

export const otpEmailTemplate = (name: string, code: string) => `
<!DOCTYPE html>
<html dir="rtl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .logo {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
      }
      h1 {
        color: #1a202c;
        font-size: 24px;
        margin: 10px 0;
      }
      .subtitle {
        color: #718096;
        font-size: 16px;
        margin-bottom: 30px;
      }
      .code-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 30px;
        text-align: center;
        margin: 30px 0;
      }
      .code {
        font-size: 48px;
        font-weight: bold;
        color: white;
        letter-spacing: 8px;
        font-family: 'Courier New', monospace;
      }
      .info {
        color: #4a5568;
        font-size: 14px;
        line-height: 1.6;
        margin: 20px 0;
      }
      .warning {
        background: #fef3c7;
        border-right: 4px solid #f59e0b;
        padding: 15px;
        border-radius: 8px;
        color: #92400e;
        font-size: 13px;
        margin-top: 20px;
      }
      .footer {
        text-align: center;
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
        color: #a0aec0;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h1>שלום ${name}!</h1>
        <p class="subtitle">קיבלנו בקשה להתחבר למערכת TaskFlow</p>
      </div>

      <div class="code-container">
        <div class="code">${code}</div>
      </div>

      <div class="info">
        <p><strong>קוד האימות שלך:</strong> ${code}</p>
        <p>הזן את הקוד במסך ההתחברות כדי להמשיך.</p>
      </div>

      <div class="warning">
        ⏱️ <strong>שים לב:</strong> הקוד תקף למשך 10 דקות בלבד. לאחר מכן יהיה עליך לבקש קוד חדש.
      </div>

      <div class="info" style="margin-top: 30px;">
        <p><strong>לא ביקשת קוד זה?</strong></p>
        <p>אם לא ביקשת קוד אימות, אנא התעלם מהודעה זו. ייתכן שמישהו הזין את כתובת המייל שלך בטעות.</p>
      </div>

      <div class="footer">
        <p>© 2025 TaskFlow - מערכת ניהול משימות מתקדמת</p>
        <p>הודעה זו נשלחה אוטומטית, אין להשיב עליה.</p>
      </div>
    </div>
  </body>
</html>
`

export const invitationEmailTemplate = (
  name: string,
  code: string,
  inviterName: string,
  appUrl: string
) => `
<!DOCTYPE html>
<html dir="rtl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .logo {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
      }
      h1 {
        color: #1a202c;
        font-size: 24px;
        margin: 10px 0;
      }
      .welcome-box {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 30px;
        color: white;
        text-align: center;
        margin: 30px 0;
      }
      .welcome-box h2 {
        margin: 0 0 10px 0;
        font-size: 20px;
      }
      .welcome-box p {
        margin: 5px 0;
        opacity: 0.9;
      }
      .code-section {
        background: #f7fafc;
        border-radius: 12px;
        padding: 25px;
        text-align: center;
        margin: 30px 0;
      }
      .code-label {
        color: #4a5568;
        font-size: 14px;
        margin-bottom: 10px;
      }
      .code {
        font-size: 36px;
        font-weight: bold;
        color: #667eea;
        letter-spacing: 6px;
        font-family: 'Courier New', monospace;
        margin: 10px 0;
      }
      .button {
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 40px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: bold;
        margin: 20px 0;
        box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
      }
      .info {
        color: #4a5568;
        font-size: 14px;
        line-height: 1.8;
        margin: 20px 0;
      }
      .steps {
        background: #f7fafc;
        border-radius: 12px;
        padding: 20px;
        margin: 20px 0;
      }
      .step {
        display: flex;
        align-items: start;
        margin: 15px 0;
      }
      .step-number {
        background: #667eea;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-left: 15px;
        flex-shrink: 0;
      }
      .step-text {
        flex: 1;
        padding-top: 5px;
      }
      .footer {
        text-align: center;
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
        color: #a0aec0;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h1>ברוך הבא למערכת TaskFlow! 🎉</h1>
      </div>

      <div class="welcome-box">
        <h2>שלום ${name}!</h2>
        <p><strong>${inviterName}</strong> הזמין אותך להצטרף למערכת</p>
        <p>מערכת ניהול משימות מתקדמת לעבודה משותפת</p>
      </div>

      <div class="info">
        <p><strong>התחברות ראשונה למערכת:</strong></p>
        <p>כדי להתחבר, תצטרך להזין את כתובת המייל שלך ואת קוד האימות הבא:</p>
      </div>

      <div class="code-section">
        <div class="code-label">קוד האימות שלך</div>
        <div class="code">${code}</div>
        <div class="code-label">תוקף: 10 דקות</div>
      </div>

      <div style="text-align: center;">
        <a href="${appUrl}" class="button">
          היכנס למערכת →
        </a>
      </div>

      <div class="steps">
        <h3 style="margin: 0 0 20px 0; color: #1a202c;">שלבי ההתחברות:</h3>
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-text">לחץ על הכפתור "היכנס למערכת" למעלה</div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-text">הזן את כתובת המייל שלך: <strong>${name.split(' ')[0]}@...</strong></div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-text">הזן את קוד האימות: <strong>${code}</strong></div>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-text">התחל לעבוד! 🚀</div>
        </div>
      </div>

      <div class="info" style="margin-top: 30px; background: #f0fdf4; padding: 15px; border-radius: 8px; border-right: 4px solid #10b981;">
        <p><strong>💡 טיפ:</strong> בכל כניסה למערכת תקבל קוד חדש למייל - זה מבטיח שהמערכת שלך מאובטחת תמיד!</p>
      </div>

      <div class="footer">
        <p>© 2025 TaskFlow - מערכת ניהול משימות מתקדמת</p>
        <p>הודעה זו נשלחה אוטומטית, אין להשיב עליה.</p>
      </div>
    </div>
  </body>
</html>
`
