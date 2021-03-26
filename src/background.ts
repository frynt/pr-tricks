console.log('aaaaaaaaaaaa, in service worker view tab in google chrome for developers');
if ('serviceWorker' in navigator) {
  console.log('bbbbbbbbbb');
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(function (registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function (err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}