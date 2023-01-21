import axios from 'axios';
import fsp from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';

const getFileName = (url2, originUrl) => {
  const url = new URL(url2, originUrl);
  const { hostname, pathname } = url;
  const extension = path.extname(pathname);
  // console.log('extension:', extension);

  const pathName = extension ? pathname.split(extension)[0] : pathname;
  // console.log('pathName:', pathName);

  const newName = `${hostname}${pathName}`.replace(/[^a-z0-9]/gm, '-');
  // console.log('newNamet:', newName);

  const fullNewName = extension ? `${newName}${extension}` : `${newName}.html`;
  // console.log('fullNewName:', fullNewName);

  return fullNewName;
};

const mapping = [
  { tag: 'img', attribute: 'src' },
  { tag: 'link', attribute: 'href' },
  { tag: 'script', attribute: 'src' },
];

const downloadResources = (html, dirPath, dirN, fullPath, originUrl) => {
  const $ = cheerio.load(html);

  mapping.map(({ tag, attribute }) => $(tag).each((_index, el) => {
    const elem = $(el).attr(attribute);
    // console.log('elem', elem); //
    const url = new URL(elem, originUrl);
    const { href, origin } = url;

    if (origin === originUrl && elem !== undefined) {
      const newName = getFileName(elem, originUrl);
      return axios.get(href, { responseType: 'arraybuffer' })
        .then((response) => fsp.writeFile(path.join(dirPath, newName), response.data))
        .then(() => {
          $(el).attr(attribute, path.join(dirN, newName));
          const newFile = $.html();
          return fsp.writeFile(fullPath, newFile);
        });
    }
    return null;
  }));
};

const pageLoader = (url1, dir = process.cwd()) => {
  const parseUrl = new URL(url1, url1);
  const { origin } = parseUrl;

  // const nameHtml = `${getFileName(url1, origin)}.html`;
  const nameHtml = getFileName(url1, origin);
  const fullHtmlPath = path.join(dir, nameHtml);
  // const dirName = `${getFileName(url1, origin)}_files`;
  const dirName = getFileName(url1, origin).replace('.html', '_files');
  const fullDirPath = path.join(dir, dirName);

  return axios.get(url1, {
    responseType: 'arraybuffer',
  })
    .then((response) => fsp.writeFile(fullHtmlPath, response.data))
    .then(() => fsp.access(fullDirPath))
    .catch(() => fsp.mkdir(fullDirPath))
    .then(() => fsp.readFile(fullHtmlPath, 'utf-8'))
    .then((file) => downloadResources(file, fullDirPath, dirName, fullHtmlPath, origin))
    .then(() => console.log(fullHtmlPath));
};
export default pageLoader;

// page-loader --output /var/tmp https://ru.hexlet.io/courses;
// page-loader https://ru.hexlet.io/courses;
// https://cdn2.hexlet.io/assets/logo_ru-495f05850e0095ea722a2b583565d492719579c02b0ce61d924e4f895fabf781.svg
// https://cdn2.hexlet.io/assets/at_a_laptop-8c6e59267f91a6bf13bae0e5c0f7e1f36accc440b8d760bca08ab244e2b8bdbf.png
