import axios from 'axios';
import fsp from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';
import url from 'node:url';

const getFileName = (url2) => {
  const nameWithoutProtocol = url2.split('://')[1];
  const newName = nameWithoutProtocol.replace(/[^a-z0-9]/gm, '-');
  return `${newName}.html`;
};

const getImgLink = (html, url3) => {
  const $ = cheerio.load(html);
  const imgLinks = [];

  const originUrl = new URL(url3, url3);
  const { origin } = originUrl;

  $('img').each((_index, el) => {
    const elem = $(el).attr('src');
    const myUrl2 = new URL(elem, origin);
    imgLinks.push(myUrl2.href);
    return imgLinks;
  });

  return imgLinks;
};

const getImgName = (adress) => {
  const result = adress.map((adr) => {
    const parse = url.parse(adr);
    const extn = path.extname(parse.pathname);
    const urlWithout = parse.pathname.split(extn)[0];
    const pathN = urlWithout.replace(/[^a-z0-9]/gm, '-');

    return `${pathN}${extn}`;
  });

  return result;
};

const pageLoader = (url1, dir = process.cwd()) => {
  const nameHtml = getFileName(url1);
  const fullHtmlPath = path.join(dir, nameHtml);
  const dirName = nameHtml.replace('.html', '_files');
  const fullDirPath = path.join(dir, dirName);

  const parseUrl = new URL(url1, url1);
  const { hostname } = parseUrl;
  const hostName = hostname.replace(/[^a-z0-9]/gm, '-');

  let imgUrls;
  let imgName;
  let images;
  return axios.get(url1, {
    responseType: 'arraybuffer',
  })
    .then((response) => fsp.writeFile(fullHtmlPath, response.data))
    .then(() => fsp.access(fullDirPath))
    .catch(() => fsp.mkdir(fullDirPath))
    .then(() => fsp.readFile(fullHtmlPath, 'utf-8'))
    .then((file) => getImgLink(file, url1))
    .then((imgData) => {
      imgUrls = imgData;
      // console.log('imgUrl', imgUrls); //
    })
    .then(() => getImgName(imgUrls))
    .then((newName) => {
      imgName = newName;
      // console.log('imgName', imgName); //
    })
    .then(() => {
      const promises = imgUrls.map((imgUrl) => axios.get(imgUrl, {
        responseType: 'arraybuffer',
      }));
      return Promise.all(promises);
    })
    .then((imgResponse) => imgResponse.map((resp) => resp.data))
    .then((content) => {
      images = content;
    })
    .then(() => fsp.writeFile(path.join(fullDirPath, `${hostName}${imgName[0]}`), images[0]))
    .then(() => fsp.writeFile(path.join(fullDirPath, `${hostName}${imgName[1]}`), images[1]))
    .then(() => fsp.writeFile(path.join(fullDirPath, `${hostName}${imgName[2]}`), images[2]))
    .then(() => fsp.writeFile(path.join(fullDirPath, `${hostName}${imgName[3]}`), images[3]))
    .then(() => fsp.readFile(fullHtmlPath, 'utf-8'))
    .then((file) => {
      const $ = cheerio.load(file);
      $('img').each((_index, el) => {
        const names = [];
        let i = 0;
        const elem = $(el).attr('src', path.join(dirName, hostName, imgName[i]));
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
