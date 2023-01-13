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

const getImgLink = (html) => {
  const $ = cheerio.load(html);
  return $('img').attr('src'); // [class="img-fluid d-none d-lg-block"]
};

const getImgName = (adress) => {
  const myUrl = url.parse(adress);
  // console.log(myUrl);
  const ext = path.extname(myUrl.pathname);
  const urlWithoutExt = myUrl.pathname.split(ext)[0];
  const pathName = urlWithoutExt.replace(/[^a-z0-9]/gm, '-');

  return `${pathName}${ext}`;
};

const pageLoader = (url1, dir = process.cwd()) => {
  const nameHtml = getFileName(url1);
  const fullHtmlPath = path.join(dir, nameHtml);
  const dirName = nameHtml.replace('.html', '_files');
  const fullDirPath = path.join(dir, dirName);

  const parseUrl = new URL(url1, url1);
  const { origin, hostname } = parseUrl;
  const base = origin;
  const hostName = hostname.replace(/[^a-z0-9]/gm, '-');

  let imgUrl;
  let imgName;
  return axios.get(url1, {
    responseType: 'arraybuffer',
  })
    .then((response) => fsp.writeFile(fullHtmlPath, response.data))
    .then(() => fsp.access(fullDirPath))
    .catch(() => fsp.mkdir(fullDirPath))
    .then(() => fsp.readFile(fullHtmlPath, 'utf-8'))
    .then((file) => getImgLink(file))
    .then((url2) => {
      const myUrl2 = new URL(url2, base);
      imgUrl = myUrl2.href;
      // console.log('imgUrl', imgUrl); //
    })
    .then(() => getImgName(imgUrl))
    .then((newName) => {
      imgName = newName;
      // console.log('imgName', imgName); //
    })
    .then(() => axios.get(imgUrl, {
      responseType: 'arraybuffer',
    }))
    .then((imgResponse) => fsp.writeFile(path.join(fullDirPath, `${hostName}${imgName}`), imgResponse.data))
    .then(() => console.log(fullHtmlPath));
};
export default pageLoader;

// page-loader --output /var/tmp https://ru.hexlet.io/courses;
// page-loader https://ru.hexlet.io/courses;
// https://cdn2.hexlet.io/assets/logo_ru-495f05850e0095ea722a2b583565d492719579c02b0ce61d924e4f895fabf781.svg
// https://cdn2.hexlet.io/assets/at_a_laptop-8c6e59267f91a6bf13bae0e5c0f7e1f36accc440b8d760bca08ab244e2b8bdbf.png
