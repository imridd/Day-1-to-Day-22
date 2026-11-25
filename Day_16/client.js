import { connect } from 'net';
const client = connect({ port: 57227 }, () => {
    console.log('Connected to Server');
    client.write('World \n');
});
client.on('data', data => {
    console.log(data.toString());
    client.end();

});
client.on('end', () => {
    console.log('Disconnected from server');
});