import axios from 'axios';
import fsp from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';
import getFileName from './get_file_name.js';

const mapping = [
  { tag: 'img', attribute: 'src' },
  { tag: 'link', attribute: 'href' },
  { tag: 'script', attribute: 'src' },
];

const downloadResources = (html, dirPath, dirN, fullPath, originUrl) => {
  const $ = cheerio.load(html);

  const promises = mapping.map(({ tag, attribute }) => $(tag).each((_index, el) => {
    const elem = $(el).attr(attribute);
    // console.log('elem', elem); //

    const url = new URL(elem, originUrl);
    const { href, origin } = url;

    let promise;

    if (origin === originUrl && elem !== undefined) {
      const newName = getFileName(elem, originUrl);

      promise = axios.get(href, { responseType: 'arraybuffer' })
        .then((response) => fsp.writeFile(path.join(dirPath, newName), response.data))
        .then(() => {
          $(el).attr(attribute, path.join(dirN, newName));
          const newFile = $.html();
          return fsp.writeFile(fullPath, newFile);
        });
    } else {
      return null;
    }

    return promise;
  }));

  return Promise.all(promises);
};
export default downloadResources;
