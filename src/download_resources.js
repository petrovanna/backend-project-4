import axios from 'axios';
import 'axios-debug-log';
import fsp from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';
import debug from 'debug';

import getFileName from './get_file_name.js';

const mapping = [
  { tag: 'img', attribute: 'src' },
  { tag: 'link', attribute: 'href' },
  { tag: 'script', attribute: 'src' },
];

const log = debug('page-loader');

const downloadResources = (html, dirPath, dirN, fullPath, originUrl) => {
  const $ = cheerio.load(html);
  const promises = [];

  mapping.forEach(({ tag, attribute }) => $(tag).each((_index, el) => {
    const elem = $(el).attr(attribute);

    const url = new URL(elem, originUrl);
    const { href, origin } = url;

    if (origin === originUrl && elem !== undefined) {
      const newName = getFileName(elem, originUrl);

      const promise = axios.get(href, { responseType: 'arraybuffer' })
        .then((response) => {
          log(`Loading file url: ${href}`);

          return fsp.writeFile(path.join(dirPath, newName), response.data);
        })
        .then(() => {
          log(`Loading file path: ${path.join(dirN, newName)}`);

          $(el).attr(attribute, path.join(dirN, newName));
          const newFile = $.html();
          return fsp.writeFile(fullPath, newFile);
        });
      promises.push(promise);
    }

    return null;
  }));

  return Promise.all(promises);
};

export default downloadResources;
