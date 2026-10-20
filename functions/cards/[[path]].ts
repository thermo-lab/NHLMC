export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  // If accessed by human user, redirect to main application with same query parameters
  const targetUrl = new URL('/', url.origin);
  targetUrl.search = url.search;

  return Response.redirect(targetUrl.toString(), 302);
};
