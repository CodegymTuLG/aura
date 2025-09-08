<?php
/**
 * PHP Email Form library (simple version)
 * Source: BootstrapMade (customized for testing)
 */

class PHP_Email_Form {
  public $to;
  public $from_name;
  public $from_email;
  public $subject;
  public $smtp = false;
  public $ajax = false;
  private $messages = array();

  // Thêm nội dung message
  public function add_message($content, $label) {
    $this->messages[] = "$label: $content\n";
  }

  // Gửi mail
  public function send() {
    $email_text = "You have a new message:\n\n";
    foreach ($this->messages as $message) {
      $email_text .= $message;
    }

    $headers = "From: {$this->from_name} <{$this->from_email}>\r\n";
    $headers .= "Reply-To: {$this->from_email}\r\n";

    // Nếu có cấu hình SMTP thì ở đây bạn phải dùng PHPMailer (không viết sẵn trong bản free)
    // Còn mặc định sẽ dùng hàm mail() của PHP
    if (mail($this->to, $this->subject, $email_text, $headers)) {
      return 'OK';
    } else {
      return 'Mail sending failed!';
    }
  }
}
?>
