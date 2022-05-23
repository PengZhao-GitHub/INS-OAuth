//************************ */

console.log(process.argv);

var devFlag = false;
if(process.argv[2]=='develop'){
    devFlag = true;
    console.log('Runnig in develop mode');
}



module.exports = {
    log_in_out_callBackUrl: {
        DevMode: '/profile/',
        ServiceMode: 'http://localhost:4200/profile/'
    },
    DevMode: devFlag  //control the call back URL
};