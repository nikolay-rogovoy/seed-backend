var soap = require('soap');
var url = 'http://localhost:3023/wsdl?wsdl';
var args = { firstName: 'value Stepan ' };

soap.createClient(url, function (err, client) {
    // console.log(client);
    client.sayHello(args, function (err, result/*, rawResponse, soapHeader, rawRequest*/) {
        console.log(result, err);
    });
    // let d = client.describe();
    // console.log(d, d.Hello_Service.Hello_Port.sayHello);
});
