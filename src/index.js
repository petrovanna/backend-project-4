import 'axios-debug-log';
import axios from 'axios';
import fsp from 'fs/promises';
import path from 'path';
import debug from 'debug';
import getFileName from './get_file_name.js';
import downloadResources from './download_resources.js';

const log = debug('page-loader');

const pageLoader = (url1, dir = process.cwd()) => {
  log(`URL: ${url1}`);
  log(`Download directory: ${dir}`);

  const parseUrl = new URL(url1, url1);
  const { origin } = parseUrl;

  const nameHtml = getFileName(url1, origin);
  const fullHtmlPath = path.join(dir, nameHtml);

  const dirName = getFileName(url1, origin).replace('.html', '_files');
  const fullDirPath = path.join(dir, dirName);

  return axios.get(url1, {
    responseType: 'arraybuffer',
  })
    .then((response) => {
      log('Write downloaded data to file');
      return fsp.writeFile(fullHtmlPath, response.data);
    })
    .then(() => {
      log('Create dir if not exist');
      return fsp.access(fullDirPath)
        .catch(() => fsp.mkdir(fullDirPath));
    })
    .then(() => {
      log('Read downloaded file');
      return fsp.readFile(fullHtmlPath, 'utf-8');
    })
    .then((file) => {
      log('Download resources');
      return downloadResources(file, fullDirPath, dirName, fullHtmlPath, origin);
    });
};
export default pageLoader;
