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
let expectedHtml;

beforeEach(async () => {
  tmpDir = await fsp.mkdtemp(join(os.tmpdir(), 'page-loader-'));
  nock('https://ru.hexlet.io').get('/courses').reply(200, expectedHtml);
  await pageLoader('https://ru.hexlet.io/courses', tmpDir);
});

beforeAll(async () => {
  expectedHtml = await readFixture('expected.txt');
});

test('1) Should return full path', async () => {
  const file = await fsp.readdir(tmpDir);
  expect(file[0]).toEqual('ru-hexlet-io-courses.html');
});

test('2) Should load page', async () => {
  const fileName = await fsp.readdir(tmpDir);
  const page = await fsp.readFile(join(tmpDir, fileName[0]), 'utf-8');
  expect(page).toEqual(expectedHtml);
});
