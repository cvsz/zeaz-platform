package marqeta

import(
"context"
"time"
)

type RetryConfig struct{Max int;Backoff time.Duration}

func Retry(ctx context.Context,cfg RetryConfig,fn func()error)error{
var err error
for i:=0;i<cfg.Max;i++{
if ctx.Err()!=nil{return ctx.Err()}
err=fn()
if err==nil{return nil}
select{case<-ctx.Done():return ctx.Err();case<-time.After(cfg.Backoff*time.Duration(i+1)):}
}
return err
}
