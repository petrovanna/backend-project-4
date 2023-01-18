import axios from 'axios';
import fsp from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';
// import url from 'node:url';

const getFileName = (url2) => {
  const nameWithoutProtocol = url2.split('://')[1];
  const newName = nameWithoutProtocol.replace(/[^a-z0-9]/gm, '-');
  return `${newName}.html`;
};

const downloadResources = (html, url3, dirPath) => {
  const $ = cheerio.load(html);
  const names = [];

  const originUrl = new URL(url3, url3);
  const { origin } = originUrl;

  $('img').each((_index, el) => {
    const elem = $(el).attr('src');
    const myUrl2 = new URL(elem, origin);
    const { href, pathname, hostname } = myUrl2;

    const extension = path.extname(pathname);
    const urlWithoutExt = pathname.split(extension)[0];
    const newName = `${urlWithoutExt.replace(/[^a-z0-9]/gm, '-')}${extension}`;

    // console.log(path.join(dirPath, `${hostname}${newName}`));
    names.push(newName);
    return axios.get(href, { responseType: 'arraybuffer' })
      .then((response) => fsp.writeFile(path.join(dirPath, `${hostname}${newName}`), response.data));
  });
  return names;
};

/* const changeLinks = (file, imageNames, dirName, hostName) => {
  const $ = cheerio.load(file);
  $('img').each((_index, el) => () => {
    const names = [];
    const elem = $(el).attr('src', path.join(dirName, `${hostName}${imageNames}`));
    names.push(elem);

    return names;
  });
  const newFile = $.html();
  return fsp.writeFile(fullHtmlPath, newFile);
}; */

const pageLoader = (url1, dir = process.cwd()) => {
  const nameHtml = getFileName(url1);
  const fullHtmlPath = path.join(dir, nameHtml);
  const dirName = nameHtml.replace('.html', '_files');
  const fullDirPath = path.join(dir, dirName);

  const parseUrl = new URL(url1, url1);
  const { hostname } = parseUrl;
  const hostName = hostname.replace(/[^a-z0-9]/gm, '-');

  let imgNames;

  return axios.get(url1, {
    responseType: 'arraybuffer',
  })
    .then((response) => fsp.writeFile(fullHtmlPath, response.data))
    .then(() => fsp.access(fullDirPath))
    .catch(() => fsp.mkdir(fullDirPath))
    .then(() => fsp.readFile(fullHtmlPath, 'utf-8'))
    .then((file) => downloadResources(file, url1, fullDirPath)) // получаю массив ссылок на картинки
    .then((imgData) => {
      imgNames = imgData;
      // console.log(imgNames);
    })
    .then(() => fsp.readFile(fullHtmlPath, 'utf-8'))
    .then((file) => {
      const $ = cheerio.load(file);
      $('img').each((_index, el) => {
        const names = [];
        let i = 0;
        const elem = $(el).attr('src', path.join(dirName, `${hostName}${imgNames[i]}`));
        names.push(elem);
        i += 1;
        return names;
      });
      const newFile = $.html();
      return fsp.writeFile(fullHtmlPath, newFile);
    })
    .then(() => console.log(fullHtmlPath));
};
export default pageLoader;

// page-loader --output /var/tmp https://ru.hexlet.io/courses;
// page-loader https://ru.hexlet.io/courses;
// https://cdn2.hexlet.io/assets/logo_ru-495f05850e0095ea722a2b583565d492719579c02b0ce61d924e4f895fabf781.svg
// https://cdn2.hexlet.io/assets/at_a_laptop-8c6e59267f91a6bf13bae0e5c0f7e1f36accc440b8d760bca08ab244e2b8bdbf.png
