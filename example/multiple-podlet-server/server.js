import express from 'express';
import Header from './header.js';
import Footer from './footer.js';
import Menu from './menu.js';

const app = express();

const header = new Header();
const menu = new Menu();
const footer = new Footer();

app.use('/header', header.router());
app.use('/menu', menu.router());
app.use('/footer', footer.router());

app.listen(7200, () => {
    console.log(`Podlet server running at http://localhost:7200/`);
    console.log(`Podlets:`);
    console.log(`  - http://localhost:7200/header/`);
    console.log(`  - http://localhost:7200/menu/`);
    console.log(`  - http://localhost:7200/footer/`);
});
