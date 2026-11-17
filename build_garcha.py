import sys,os
d=sys.argv[1]
s=open(os.path.join(d,'shell.html')).read()
def put(ph,f):
    global s
    c=open(os.path.join(d,f)).read().replace('</script','<\\/script')
    assert s.count(ph)==1,ph
    s=s.replace(ph,c)
put('/*DATA*/','data.js');put('/*PLDATA*/','planner_data.js');put('/*PREPDATA*/','prep_data.js');put('/*TRADEDATA*/','trade_data.js');put('/*APP*/','app.js')
open(os.path.join(d,'index.html'),'w').write(s);print('built',len(s))
