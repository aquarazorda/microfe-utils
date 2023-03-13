export const getBaseName = (baseRoute: string) => window.location.pathname.match(new RegExp(`.*?${baseRoute}`))?.[0];

export default getBaseName;
