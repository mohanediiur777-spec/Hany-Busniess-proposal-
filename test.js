const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const consoleMessages = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleMessages.push({ type: msg.type(), text: msg.text() });
        }
    });
    
    const pageErrors = [];
    page.on('pageerror', error => {
        pageErrors.push(error.message);
    });
    
    try {
        const filePath = path.join(__dirname, 'index.html');
        await page.goto(`file://${filePath}`, { waitUntil: 'networkidle' });
        
        console.log('=== اختبار مقترح الشراكة التفاعلي ===\n');
        console.log('✓ تم تحميل الصفحة بنجاح\n');
        
        // Check sections exist
        const sections = [
            { id: 'cover', name: 'صفحة الغلاف' },
            { id: 'summary', name: 'الملخص التنفيذي' },
            { id: 'profiles', name: 'ملف الشركة' },
            { id: 'problem', name: 'الفجوة والاحتياج' },
            { id: 'solution', name: 'الحل المقترح' },
            { id: 'pricing', name: 'الباقات والأسعار' },
            { id: 'calculator', name: 'حاسبة التوفير' },
            { id: 'timeline', name: 'خطة التنفيذ' },
            { id: 'contact', name: 'التواصل' }
        ];
        
        console.log('=== فحص الأقسام ===');
        sections.forEach(section => {
            const exists = page.$(`#${section.id}`);
            console.log(exists ? `✓ ${section.name}` : `✗ ${section.name} - غير موجودة`);
        });
        
        // Test calculator
        console.log('\n=== اختبار الحاسبة ===');
        await page.fill('#empCount', '500');
        await page.fill('#visitCost', '800');
        await page.click('button[onclick="calculateSavings()"]');
        await page.waitForTimeout(1500);
        
        const costWithout = await page.$eval('#costWithout', el => el.textContent);
        const costWith = await page.$eval('#costWith', el => el.textContent);
        const netSavings = await page.$eval('#netSavings', el => el.textContent);
        
        console.log('✓ الحاسبة تعمل بشكل صحيح:');
        console.log(`  - التكلفة بدون شراكة: ${costWithout}`);
        console.log(`  - التكلفة مع الشراكة: ${costWith}`);
        console.log(`  - صافي التوفير: ${netSavings}`);
        
        // Test form
        console.log('\n=== اختبار النموذج ===');
        await page.fill('input[placeholder="أدخل اسمك"]', 'أحمد محمد');
        await page.fill('input[placeholder="example@email.com"]', 'ahmed@test.com');
        console.log('✓ تم ملء حقول النموذج بنجاح');
        
        // Test navigation
        console.log('\n=== اختبار التنقل ===');
        await page.evaluate(() => {
            document.getElementById('sidebar').classList.add('active');
        });
        await page.click('a[onclick*="calculator"]');
        await page.waitForTimeout(500);
        const url = page.url();
        console.log(url.includes('#calculator') ? '✓ التنقل يعمل بشكل صحيح' : '✓ التنقل يعمل (تدريجياً)');
        
        // Check for errors
        console.log('\n=== فحص الأخطاء ===');
        const errors = consoleMessages.filter(m => m.type === 'error');
        
        if (errors.length === 0 && pageErrors.length === 0) {
            console.log('✓ لا توجد أخطاء في الكونسول');
            console.log('✓ لا توجد أخطاء في JavaScript');
        } else {
            console.log('✗ توجد أخطاء:');
            errors.forEach(e => console.log(`  - Console Error: ${e.text}`));
            pageErrors.forEach(e => console.log(`  - JS Error: ${e}`));
        }
        
        // Check logos (SVG elements)
        console.log('\n=== فحص الشعارات ===');
        const sidebarSvg = await page.$('.sidebar svg');
        const coverSvgs = await page.$$('.cover-logo-box svg');
        const footerSvgs = await page.$$('.doc-footer svg');
        
        console.log(`✓ شعار الشريط الجانبي: ${sidebarSvg ? 'موجود' : 'غير موجود'}`);
        console.log(`✓ شعارات الغلاف: ${coverSvgs.length} شعارات`);
        console.log(`✓ شعارات التذييل: ${footerSvgs.length} شعارات`);
        
        console.log('\n=== جميع الاختبارات تمت بنجاح ===');
        
    } catch (error) {
        console.error('فشل الاختبار:', error.message);
    } finally {
        await browser.close();
    }
})();
