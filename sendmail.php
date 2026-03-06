<?php
// Simple mailer script
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $to = "mdfmebel_ru@mail.ru";
    $subject = "Новая заявка с сайта MDF MEBEL";
    
    $name = htmlspecialchars(trim($_POST["name"] ?? ""));
    $phone = htmlspecialchars(trim($_POST["phone"] ?? ""));
    $message = htmlspecialchars(trim($_POST["message"] ?? ""));
    $privacy = isset($_POST["privacy"]) ? "Да" : "Нет";
    
    if (empty($name) || empty($phone)) {
        http_response_code(400);
        echo "Пожалуйста, заполните обязательные поля.";
        exit;
    }
    
    $body = "Имя: $name\n";
    $body .= "Телефон: $phone\n";
    if (!empty($message)) {
        $body .= "Сообщение: $message\n";
    }
    $body .= "Согласие на обработку ПД: $privacy\n";
    
    $headers = "From: no-reply@" . $_SERVER['HTTP_HOST'] . "\r\n" .
               "Reply-To: no-reply@" . $_SERVER['HTTP_HOST'] . "\r\n" .
               "Content-Type: text/plain; charset=UTF-8\r\n" .
               "X-Mailer: PHP/" . phpversion();
               
    if (mail($to, $subject, $body, $headers)) {
        http_response_code(200);
        echo "Заявка успешно отправлена.";
    } else {
        http_response_code(500);
        echo "Ошибка при отправке заявки на сервере.";
    }
} else {
    http_response_code(403);
    echo "Доступ запрещен.";
}
?>
