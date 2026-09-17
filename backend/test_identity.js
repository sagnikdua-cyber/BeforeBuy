import { getCanonicalIdentity, isAuthorizedDemoProduct } from './src/utils/identity.js';

const testCases = [
    { title: 'Samsung Galaxy S25 Ultra 5G 12GB / 256GB', expected: true },
    { title: 'Samsung Galaxy S25 Ultra 5G 12GB / 512GB', expected: false },
    { title: 'Samsung Galaxy S25 Ultra 5G 16GB / 512GB', expected: false },
    { title: 'Samsung Galaxy S25 Ultra 5G 12GB / 128GB', expected: false },
    { title: 'Samsung Galaxy S24 Ultra 12GB / 256GB', expected: false },
    { title: 'Samsung Galaxy S25 12GB / 256GB', expected: false },
    { title: 'Samsung Galaxy S25 Ultra 5G 12GB / 256GB Titanium Silverblue', expected: true },
    { title: 'Samsung Galaxy S25 Ultra 5G (12GB RAM + 256GB Storage) Titanium Silverblue', expected: true },
    { title: 'Samsung Galaxy S25 Ultra 5G - 256 GB, 12 GB RAM, Titanium Silverblue', expected: true }
];

let allPassed = true;
testCases.forEach((tc, i) => {
    const id = getCanonicalIdentity(tc.title);
    const auth = isAuthorizedDemoProduct(id);
    const passed = auth === tc.expected;
    if (!passed) allPassed = false;
    console.log(`Test ${i+1}: ${passed ? 'PASS' : 'FAIL'} | "${tc.title}" -> auth: ${auth} (expected: ${tc.expected})`);
    if (!passed) {
        console.log('  Identity:', id);
    }
});

if (allPassed) {
    console.log('\nALL MATCHING TESTS PASSED');
} else {
    console.log('\nSOME TESTS FAILED');
}
