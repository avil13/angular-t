ngDescribe({
    name: '',
    modules: ['templater'],
    inject:  ['templater'],
    tests: function(deps, describeApi){
        it('test example', function(){
            expect(typeof deps.templater).toEqual('function');
        });
    }
});
