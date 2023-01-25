import path from 'path';

const getFileName = (url2, originUrl) => {
  const url = new URL(url2, originUrl);
  const { hostname, pathname } = url;
  // console.log('url:', url); //

  const extension = path.extname(pathname);
  // console.log('extension:', extension); //

  const pathName = extension ? pathname.split(extension)[0] : pathname;
  // console.log('pathName:', pathName); //

  const newName = pathName === '/' ? `${hostname}`.replace(/[^a-z0-9]/gm, '-') : `${hostname}${pathName}`.replace(/[^a-z0-9]/gm, '-');
  // console.log('newNamet:', newName); //

  const fullNewName = extension ? `${newName}${extension}` : `${newName}.html`;
  // console.log('fullNewName:', fullNewName); //

  return fullNewName;
};
export default getFileName;
