import {
  test, expect, beforeEach, beforeAll,
} from '@jest/globals';
import os from 'os';
import nock from 'nock';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fsp from 'fs/promises';
import pageLoader from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) => join(__dirname, '..', '__fixtures__', filename);
const readFixture = (filename) => fsp.readFile(getFixturePath(filename), 'utf-8');

nock.disableNetConnect();

let tmpDir;
let beforeHTML;
// let afterHtml;
// let image;

beforeAll(async () => {
  beforeHTML = await readFixture('before.html');
  // afterHtml = await readFixture('after.html');
  // image = await readFixture('img.png');
});

beforeEach(async () => {
  tmpDir = await fsp.mkdtemp(join(os.tmpdir(), 'page-loader-'));
});

test('1) Should return full path', async () => {
  nock('https://ru.hexlet.io').get('/courses').reply(200, beforeHTML);
  await pageLoader('https://ru.hexlet.io/courses', tmpDir);
  const file = await fsp.readdir(tmpDir);
  expect(file[0]).toEqual('ru-hexlet-io-courses.html');
});

test('2) Should load page', async () => {
  nock('https://ru.hexlet.io').get('/courses').reply(200, beforeHTML);
  await pageLoader('https://ru.hexlet.io/courses', tmpDir);
  const fileName = await fsp.readdir(tmpDir);
  const page = await fsp.readFile(join(tmpDir, fileName[0]), 'utf-8');
  expect(page).toEqual(beforeHTML);
});

test('3) Should create dir: "ru-hexlet-io-courses_files"', async () => {
  nock('https://ru.hexlet.io').get('/courses').reply(200, beforeHTML);
  await pageLoader('https://ru.hexlet.io/courses', tmpDir);
  const fullDirPath = join(tmpDir, 'ru-hexlet-io-courses_files');
  const stats = await fsp.stat(fullDirPath);
  expect(stats.isDirectory()).toBe(true);
});

/* test('4) Should load img', async () => {
  const dirName = await fsp.readdir(tmpDir);
  console.log('dirName:', dirName);
  const img = await fsp.readFile(join(tmpDir, dirName[1],
     'ru-hexlet-io-assets-professions-nodejs.png'));
  console.log('img', img);
  expect(img).toEqual(image);
}); */
