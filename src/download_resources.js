import axios from 'axios';
import 'axios-debug-log';
import fsp from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';

import Listr from 'listr';

import getFileName from './get_file_name.js';

const mapping = [
  { tag: 'img', attribute: 'src' },
  { tag: 'link', attribute: 'href' },
  { tag: 'script', attribute: 'src' },
];

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
        .then((response) => fsp.writeFile(path.join(dirPath, newName), response.data))
        .then(() => {
          $(el).attr(attribute, path.join(dirN, newName));
          const newFile = $.html();
          return fsp.writeFile(fullPath, newFile);
        });
      promises.push({ title: newName, task: () => promise });
    }

    return null;
  }));
  const tasks = new Listr(promises, { concurrent: true });
  return tasks.run();
  // return Promise.all(promises);
};

export default downloadResources;
