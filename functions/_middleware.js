export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === "www.1so.org") {
    url.hostname = "1so.org";
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
