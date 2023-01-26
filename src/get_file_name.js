import path from 'path';

const getFileName = (url2, originUrl) => {
  const url = new URL(url2, originUrl);
  const { hostname, pathname } = url;

  const extension = path.extname(pathname);

  const pathName = extension ? pathname.split(extension)[0] : pathname;

  const newName = pathName === '/' ? `${hostname}`.replace(/[^a-z0-9]/gm, '-') : `${hostname}${pathName}`.replace(/[^a-z0-9]/gm, '-');

  const fullNewName = extension ? `${newName}${extension}` : `${newName}.html`;

  return fullNewName;
};
export default getFileName;
