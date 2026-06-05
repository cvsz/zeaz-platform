<?php
require_once('fpdf.php');
class PDF extends FPDF
{

    function invoice($invoice)
    {
        //TODO: authorized admin or owner...owner function
        global $CONFIG;
        setlocale(LC_MONETARY, 'en_US');

        //all date into simple variables
		
		//$user = $this->logged_in();
		//$login = $user['group_id'];
		$company_details[0] = (isset($CONFIG['company']['address'])) ? 'Company Name :'.$CONFIG['company']['name_show'] : '';
		$company_details[1] = (isset($CONFIG['company']['onrc'])) ? $CONFIG['company']['onrc'] : '';
		$company_details[2] = (isset($CONFIG['company']['vat'])) ? $CONFIG['company']['vat'] : '';
		$company_details[3] = (isset($CONFIG['company']['address'])) ? $CONFIG['company']['address'] : '';
		$company_details[4] = (isset($CONFIG['company']['address_2'])) ? $CONFIG['company']['address_2'] : '';
		$company_details[5] = (isset($CONFIG['company']['bank_name'])) ? $CONFIG['company']['bank_name'] : '';
		$company_details[6] = (isset($CONFIG['company']['bank_iban'])) ? $CONFIG['company']['bank_iban'] : '';
		$company_details[7] = (isset($CONFIG['company']['bank_swift'])) ? $CONFIG['company']['bank_swift'] : '';
		$company_details[8] = (isset($CONFIG['company']['email'])) ? $CONFIG['company']['email'] : '';
		$company_details[9] = (isset($CONFIG['company']['phone'])) ? $CONFIG['company']['phone'] : '';
		$vatSet = '*CUI(Tax ID)';
		$vatnr = (isset($CONFIG['company']['vat'])) ? str_replace('*CUI(Tax ID) :','',$CONFIG['company']['vat']) : '';
		$company_details[5] = strip_tags($CONFIG['company']['bank_name']);
		$company_details[6] = strip_tags($CONFIG['company']['bank_iban']);
		$company_details[7] = strip_tags($CONFIG['company']['bank_swift']);
		
		$vattax = $CONFIG['company']['vattax'];

        $client = $invoice['client'];
        $clientname = (!empty($client['name'])) ? $client['name'] : '';
		$clientcompany = (!empty($client['contact_person'])) ? $client['contact_person'] : '';
        $clientaddress1 = (!empty($client['address_line_1'])) ? $client['address_line_1'] : '';
        $clientaddress2 = (!empty($client['address_line_2'])) ? $client['address_line_2'] : '';
        $clientcontactemail = (!empty($client['contact_email'])) ? $client['contact_email'] : '';
        $clientcontactphone = (!empty($client['contact_phone'])) ? $client['contact_phone'] : '';
		
		if (strlen($invoice['main']['invoice_number'])==3 && $invoice['main']['invoice_number'][0]=='0'){$invoice['main']['invoice_number'] = $invoice['main']['invoice_number'][1].$invoice['main']['invoice_number'][2];}
		
        $invoicenumber = $CONFIG['company']['invcode'].$invoice['main']['invoice_number'];
        $invoicedate = ($invoice['main']['date_of_issue'] != 0) ? date('M j, Y', $invoice['main']['date_of_issue']) : '';
        $invoicestatus = InvoicesController::invoice_status($invoice['main']['balance'], $invoice['main']['due_date'], is_array($invoice['line_items']));
        $invoiceduedate = ($invoice['main']['due_date'] != 0) ? date('M j, Y', $invoice['main']['due_date']) : '';


        $this->AddPage();
        $this->SetTextColor(119, 119, 119);
        $this->SetFont('arial', '', 8);


        $this->Image($CONFIG['company']['logo'], 12, 12, 55);

        $y = getimagesize($CONFIG['company']['logo']);
        $y_start = $y[1] - 35;
        $num_details = 0;
        for ($i = 0; $i < count($company_details); $i++)
        {
            if (!empty($company_details[$i]))
            {
                $y = 17 + ($num_details * 5);
				if ($i==0) {$this->SetFont('arial', 'B', 9);}
				elseif ($i==1 ||$i==2) {$this->SetFont('arial', 'I', 9);} else {$this->SetFont('arial', '', 9);}
                $this->Text(82, $y, str_replace('<span style="font-style:italic">','',str_replace('</span>','',str_replace('<strong>','',str_replace('</strong>','',$company_details[$i])))));
                $num_details++;
            }

        }

        $this->SetFont('arial', '', 9);
        $this->Text(12, 65, "To");
        $this->SetFont('arial', 'B', 9);
        $this->SetTextColor(0, 0, 0);
        $this->Text(12, 70, $clientcompany);
        $this->Text(12, 73, 'Company:'.$clientname);
        $this->SetTextColor(119, 119, 119);
		$this->SetFont('arial', 'I', 8);
		$this->SetXY(10, 75);
		$this->MultiCell(65,5,str_replace('br2nl','',$clientaddress1.','.$clientaddress2),0, 'L', false);
		$this->MultiCell(65, 5, $clientcontactemail);
        $this->MultiCell(65, 10, $clientcontactphone);
        $this->SetFont('arial', '', 8);

        $c = 170;
        $this->SetXY(80, 77);
        $this->SetFont('arial', '', 9);
        $this->SetTextColor($c, $c, $c);
        $this->Cell(20, 5, 'Pro-Forma Invoice ', 0, 0, 'R');
        $this->SetTextColor(0, 0, 0);
        $this->Cell(20, 5, $invoicenumber, 0, 2, 'L');
        $this->SetTextColor($c, $c, $c);
        $this->SetXY(80, 83);
        $this->Cell(20, 5, 'Invoice Date', 0, 0, 'R');
        $this->SetTextColor(0, 0, 0);
        $this->Cell(20, 5, $invoicedate, 0, 2, 'L');
        $this->SetTextColor($c, $c, $c);
        $this->SetXY(80, 89);
        $this->Cell(20, 5, 'Invoice Status', 0, 0, 'R');
        $this->SetTextColor(0, 0, 0);
        $this->Cell(20, 5, $invoicestatus, 0, 2, 'L');
		
		$this->SetTextColor($c, $c, $c);
        $this->SetXY(81, 95);
        $this->Cell(20, 5, $vatSet, 0, 0, 'R');
        $this->SetTextColor(0, 0, 0);
        $this->Cell(20, 5, trim($company_details[2],'*CUI(Tax ID) :'), 0, 2, 'L');

        $this->SetFillColor(224, 243, 251);
        $this->RoundedRect(170, 58, 27, 10, 0, 'F', '1234');
        $this->SetFont('arial', '', 10);
        $this->SetTextColor(0, 0, 0);
        $this->SetXY(150, 58);
        $this->Cell(20, 10, 'Payment Due:', 0, 0, 'R');
        $this->SetTextColor(0, 0, 0);
        $this->Cell(27, 10, $invoiceduedate, 0, 2, 'C');

        //Items Header
        $w1 = 80;
        $w2 = 35;
        $w3 = 35;
        $w4 = 35;
        $this->SetXY(12, 105);
        $this->SetFont('arial', 'B', 8);
        $this->SetTextColor(119, 119, 119);
        $this->SetDrawColor(231, 240, 244);
        $this->SetFillColor(248, 248, 248);
        $this->Cell($w1, 5, 'NAME', 'B', 0, 'C', true);
        $this->Cell($w2, 5, 'HRS/QTY', 'B', 0, 'C', true);
        $this->Cell($w3, 5, 'RATE', 'B', 0, 'C', true);
        $this->Cell($w4, 5, 'SUBTOTAL', 'B', 0, 'C', true);

        //Items loop
        for ($i = 0;
             $i < count($invoice['line_items']);
             $i++)
        {
            $this->SetXY(12, 110.1 + (17 * $i));
            $this->SetFont('arial', '', 8);
            $this->SetFillColor(244, 248, 250);
            $this->Cell($w1, 7, $invoice['line_items'][$i]['item_name'], 0, 0, 'L', true);
            $this->Cell($w2, 7, $invoice['line_items'][$i]['item_quantity'], 0, 0, 'C', true);
            $this->Cell($w3, 7, EURO .' '. cash_format_cws($invoice['line_items'][$i]['item_rate'], 0, '.', ','), 0, 0, 'C', true);
            $this->Cell($w4, 7, EURO .' '. cash_format_cws($invoice['line_items'][$i]['item_quantity'] * $invoice['line_items'][$i]['item_rate'], 0, '.', ','), 0, 0, 'C', true);
            $this->SetXY(12, 117.1 + (17 * $i));
            $this->SetFont('arial', '', 8);
            $this->MultiCell($w1, 5, $invoice['line_items'][$i]['description'], 0, 'L', false);
        }

//Totals table
        $ht = 7;
		$this->SetXY(16, 120 + (15 * $i));
        $this->SetFont('arial', '', 8);
        $this->SetTextColor(0, 0, 0);
        $this->Cell(50, $ht, 'VAT TAX:', '', 0, 'L', false);
		
		$this->Image($CONFIG['company']['stamp'], 18,130 + (15 * $i),40,27);
		
		$this->SetXY(31, 120 + (15 * $i));
        $this->SetFont('arial', 'B', 8);
        $this->SetTextColor(0, 0, 0);
        $this->Cell(50, $ht, $vattax.'%', 'B', 0, 'L', false);
		
        $this->SetXY(106, 120 + (15 * $i));
        $this->SetFont('arial', 'B', 8);
        $this->SetTextColor(119, 119, 119);
        $this->SetDrawColor(231, 240, 244);
        $this->SetFillColor(248, 248, 248);
        $this->Cell(90, $ht, 'INVOICE SUMMARY', 'B', 0, 'C', true);
        $this->SetXY(106, 120.1 + (15 * $i) + ($ht * 1));
        $this->SetFont('arial', '', 8);
        $this->SetTextColor(0, 0, 0);
        $this->Cell(50, $ht, 'Subtotal:', 'B', 0, 'L', false);
        $this->Cell(40, $ht, EURO .' '. cash_format_cws($invoice['main']['total'], 0, '.', ','), 'B', 0, 'R', false);
		
		$this->SetXY(106, 120.1 + (15 * $i) + ($ht * 2));
        $this->SetFont('arial', '', 8);
        $this->SetTextColor(0, 0, 0);
        $this->Cell(50, $ht, 'VAT:', 'B', 0, 'L', false);
        $this->Cell(40, $ht, EURO .' '. cash_format_cws(0, 0, '.', ','), 'B', 0, 'R', false);

		
		$this->SetXY(106, 120.1 + (15 * $i) + ($ht * 3));
        $this->SetFont('arial', '', 8);
        $this->SetTextColor(0, 0, 0);
        $this->Cell(50, $ht, 'Total:', 'B', 0, 'L', false);
        $this->Cell(40, $ht, EURO .' '. cash_format_cws($invoice['main']['total'], 0, '.', ','), 'B', 0, 'R', false);
		
        $this->SetXY(106, 120.2 + (15 * $i) + ($ht * 4));
        $this->Cell(50, $ht, 'Payments:', 'B', 0, 'L', false);
        $this->Cell(40, $ht, EURO .' '. cash_format_cws($invoice['main']['payments'], 0, '.', ','), 'B', 0, 'R', false);
		
		 $this->SetXY(106, 120.2 + (15 * $i) + ($ht * 5));
        $this->Cell(50, $ht, 'Payment Method:', 'B', 0, 'L', false);
        $this->Cell(40, $ht, ' '. $invoice['main']['payment_method'], 'B', 0, 'R', false);
		
        $this->SetXY(106, 120.3 + (15 * $i) + ($ht * 6));
        $this->SetFont('arial', 'B', 8);
        $this->Cell(50, $ht, 'Remaining Balance:', 'B', 0, 'L', false);
        $this->Cell(40, $ht, EURO .' '. cash_format_cws($invoice['main']['balance'], 0, '.', ','), 'B', 0, 'R', false);

        $terms = explode('<br />',$CONFIG['invoice']['default_terms']);
        $this->SetXY(12, 149.3 + (15 * $i) + ($ht * 3));
        $this->SetFont('arial', '', 8);
        $this->SetTextColor(119, 119, 119);
        $this->MultiCell(179, 5, $terms[0], 0, 'L', false);
		$this->MultiCell(184, 5,$terms[1], 0, 'L', false);
		$this->MultiCell(189, 5,$terms[2], 0, 'L', false);

        $filename = $CONFIG['uploads']['path'] . "invoices\\" . $invoice['main']['invoice_number'] . '.pdf';
        $this->Output($filename); //generat the invoice and then use any where.

        error_reporting(0);
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename=' . basename($filename));
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');
        header('Content-Length: ' . filesize($filename));
        ob_clean();
        flush();
        readfile($filename);
        unlink($filename);
        exit;
    }

    function RoundedRect($x, $y, $w, $h, $r, $style = '', $angle = '1234')
    {
        $k = $this->k;
        $hp = $this->h;
        if ($style == 'F')
            $op = 'f';
        elseif ($style == 'FD' or $style == 'DF')
            $op = 'B';
        else
            $op = 'S';
        $MyArc = 4 / 3 * (sqrt(2) - 1);
        $this->_out(sprintf('%.2f %.2f m', ($x + $r) * $k, ($hp - $y) * $k));

        $xc = $x + $w - $r;
        $yc = $y + $r;
        $this->_out(sprintf('%.2f %.2f l', $xc * $k, ($hp - $y) * $k));
        if (strpos($angle, '2')===false)
            $this->_out(sprintf('%.2f %.2f l', ($x + $w) * $k, ($hp - $y) * $k));
        else
            $this->_Arc($xc + $r * $MyArc, $yc - $r, $xc + $r, $yc - $r * $MyArc, $xc + $r, $yc);

        $xc = $x + $w - $r;
        $yc = $y + $h - $r;
        $this->_out(sprintf('%.2f %.2f l', ($x + $w) * $k, ($hp - $yc) * $k));
        if (strpos($angle, '3')===false)
            $this->_out(sprintf('%.2f %.2f l', ($x + $w) * $k, ($hp - ($y + $h)) * $k));
        else
            $this->_Arc($xc + $r, $yc + $r * $MyArc, $xc + $r * $MyArc, $yc + $r, $xc, $yc + $r);

        $xc = $x + $r;
        $yc = $y + $h - $r;
        $this->_out(sprintf('%.2f %.2f l', $xc * $k, ($hp - ($y + $h)) * $k));
        if (strpos($angle, '4')===false)
            $this->_out(sprintf('%.2f %.2f l', ($x) * $k, ($hp - ($y + $h)) * $k));
        else
            $this->_Arc($xc - $r * $MyArc, $yc + $r, $xc - $r, $yc + $r * $MyArc, $xc - $r, $yc);

        $xc = $x + $r;
        $yc = $y + $r;
        $this->_out(sprintf('%.2f %.2f l', ($x) * $k, ($hp - $yc) * $k));
        if (strpos($angle, '1')===false)
        {
            $this->_out(sprintf('%.2f %.2f l', ($x) * $k, ($hp - $y) * $k));
            $this->_out(sprintf('%.2f %.2f l', ($x + $r) * $k, ($hp - $y) * $k));
        }
        else
            $this->_Arc($xc - $r, $yc - $r * $MyArc, $xc - $r * $MyArc, $yc - $r, $xc, $yc - $r);
        $this->_out($op);
    }

    function _Arc($x1, $y1, $x2, $y2, $x3, $y3)
    {
        $h = $this->h;
        $this->_out(sprintf('%.2f %.2f %.2f %.2f %.2f %.2f c ', $x1 * $this->k, ($h - $y1) * $this->k,
                $x2 * $this->k, ($h - $y2) * $this->k, $x3 * $this->k, ($h - $y3) * $this->k));
    }
}
?>