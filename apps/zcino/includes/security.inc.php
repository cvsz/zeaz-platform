<?php
class Crypt
{
        var $key = NULL;
        var $iv = NULL;
        var $iv_size = NULL;
 
        function Crypt()
        {
                $this->init();
        }
 
        function init($key = "")
        {
                $this->key = ($key != "") ? $key : "";
 
                $this->algorithm = MCRYPT_DES;
                $this->mode = MCRYPT_MODE_ECB;
 
                $this->iv_size = mcrypt_get_iv_size($this->algorithm, $this->mode);
                $this->iv = mcrypt_create_iv($this->iv_size, MCRYPT_RAND);
                
                return "ok";
        }
 
        function encrypt($data)
        {
                $size = mcrypt_get_block_size($this->algorithm, $this->mode);
                $data = $this->pkcs5_pad($data, $size);
                return base64_encode(mcrypt_encrypt($this->algorithm, $this->key, $data, $this->mode, $this->iv));
        }
 
        function decrypt($data)
        {
                return $this->pkcs5_unpad(rtrim(mcrypt_decrypt($this->algorithm, $this->key, base64_decode($data), $this->mode, $this->iv)));
        }
 
        function pkcs5_pad($text, $blocksize)
        {
                $pad = $blocksize - (strlen($text) % $blocksize);
                return $text . str_repeat(chr($pad), $pad);
        }
 
        function pkcs5_unpad($text)
        {
                $pad = ord($text[strlen($text)-1]);
                if ($pad > strlen($text)) return false;
                if (strspn($text, chr($pad), strlen($text) - $pad) != $pad) return false;
                return substr($text, 0, -1 * $pad);
        }
}
function mdecrypt($string,$key){
	// init a new instance of Crypto Class
	$crypto = new Crypt;
	// init with the encryption key
	$result = $crypto->init($key);
	// decrypt data
	return $crypto->decrypt(utf8_decode($string));
}
function mencrypt($string,$key){
	// init a new instance of Crypto Class
	$crypto = new Crypt;
	// init with the encryption key
	$result = $crypto->init($key);
	// encrypt data
	return $crypto->encrypt(utf8_encode($string));
}
?>