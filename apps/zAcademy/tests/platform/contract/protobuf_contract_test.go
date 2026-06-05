package contract

import (
	"path/filepath"
	"testing"

	"github.com/jhump/protoreflect/desc/protoparse"
)

func TestPaymentProtoContract(t *testing.T) {
	protoPath := filepath.Join("payment.proto")
	p := protoparse.Parser{ImportPaths: []string{"."}}
	files, err := p.ParseFiles(protoPath)
	if err != nil {
		t.Fatalf("parse proto: %v", err)
	}
	if len(files) != 1 { t.Fatalf("expected one file") }
	fd := files[0]
	svc := fd.FindService("payment.v1.PaymentGateway")
	if svc == nil { t.Fatalf("missing PaymentGateway service") }
	m := svc.FindMethodByName("AuthorizePayment")
	if m == nil { t.Fatalf("missing AuthorizePayment method") }
	req := m.GetInputType()
	if req.FindFieldByName("payment_id") == nil || req.FindFieldByName("amount_minor") == nil || req.FindFieldByName("currency") == nil {
		t.Fatalf("request contract missing required fields")
	}
	res := m.GetOutputType()
	if res.FindFieldByName("allowed") == nil || res.FindFieldByName("reason") == nil {
		t.Fatalf("response contract missing required fields")
	}
}
