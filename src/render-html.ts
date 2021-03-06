import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';
import { defaults, DurationUnit, nodeName, TIMER_TYPE } from './helpers';

(() => {
    const srcEjsPath = path.resolve('src/controltimer.ejs');
    const ejsTemplate = String(fs.readFileSync(srcEjsPath, 'utf8'));
    const nodeHtml = ejs.render(ejsTemplate, { defaults, nodeName, TIMER_TYPE, DurationUnit });
    const distHtmlPath = path.resolve('dist/controltimer.html');
    fs.writeFileSync(distHtmlPath, nodeHtml);
})();
