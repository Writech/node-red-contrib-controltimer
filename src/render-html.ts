import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';

import { defaults, nodeName } from './node-config';
import { DurationUnit, TimerType } from './timer';

(() => {
    const srcEjsPath = path.resolve('src/controltimer.ejs');
    const ejsTemplate = fs.readFileSync(srcEjsPath, 'utf8');
    const nodeHtml = ejs.render(ejsTemplate, { defaults, nodeName, TimerType, DurationUnit });
    const distHtmlPath = path.resolve('dist/controltimer.html');
    fs.writeFileSync(distHtmlPath, nodeHtml);
})();
