import axios from 'axios';
import fsp from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';

const getFileName = (url) => {
  const nameWithoutProtocol = url.split('://')[1];
  const newName = nameWithoutProtocol.replace(/[^a-z0-9]/gm, '-');
  return `${newName}.html`;
};

const getImgLink = (html) => {
  const $ = cheerio.load(html);
  return ($('img').attr('src'));
};

const getImgName = (url) => {
  const nameWithoutProtocol = url.split('://')[1];
  const ext = path.extname(nameWithoutProtocol);
  const nameWithoutExt = nameWithoutProtocol.split(ext)[0];
  const newName = nameWithoutExt.replace(/[^a-z0-9]/gm, '-');
  return `${newName}${ext}`;
};

const pageLoader = (url, dir = process.cwd()) => {
  const nameHtml = getFileName(url);
  const fullHtmlPath = path.join(dir, nameHtml);
  const dirName = nameHtml.replace('.html', '_files');
  const fullDirPath = path.join(dir, dirName);

  return axios.get(url)
    .then((response) => fsp.writeFile(fullHtmlPath, response.data))
    .then(() => fsp.mkdir(fullDirPath))
    .then(() => fsp.readFile(fullHtmlPath, 'utf-8'))
    .then((file) => getImgLink(file))
    .then((imgUrl) => getImgName(imgUrl))
    .then(() => console.log(fullHtmlPath));
};
export default pageLoader;

// page-loader --output /var/tmp https://ru.hexlet.io/courses;
// page-loader https://ru.hexlet.io/courses;
// https://cdn2.hexlet.io/assets/logo_ru-495f05850e0095ea722a2b583565d492719579c02b0ce61d924e4f895fabf781.svg
