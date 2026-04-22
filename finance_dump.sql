-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: financehub
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `account_number` varchar(30) NOT NULL,
  `account_type` enum('SAVINGS','CHECKING','BUSINESS') NOT NULL DEFAULT 'SAVINGS',
  `balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_primary` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_number` (`account_number`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `fk_accounts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,1,'FH-100001-2025','SAVINGS',14837.50,'USD',1,'2026-03-25 02:38:19',_binary '\0'),(2,2,'FH-100002-2025','CHECKING',8691.00,'USD',1,'2026-03-25 02:38:19',_binary '\0'),(3,3,'FH-100003-2025','BUSINESS',50051.00,'USD',1,'2026-03-25 02:38:19',_binary '\0'),(4,4,'FH-100004-2025','SAVINGS',25051.00,'USD',1,'2026-03-25 22:26:53',_binary '\0'),(5,5,'FH-100005-2025','CHECKING',12000.00,'USD',1,'2026-03-25 22:26:53',_binary '\0'),(6,6,'FH-100006-2025','SAVINGS',8120.00,'USD',1,'2026-03-25 22:26:53',_binary '\0'),(7,7,'FH-989806-2026','SAVINGS',1250.00,'USD',1,'2026-03-25 17:33:51',_binary '\0'),(8,8,'FH-535838-2026','SAVINGS',1170.00,'USD',1,'2026-03-25 18:34:41',_binary '\0'),(9,9,'FH-698529-2026','SAVINGS',1000.00,'USD',1,'2026-03-29 17:12:14',_binary '\0'),(10,10,'FH-911191-2026','SAVINGS',1000.00,'USD',1,'2026-03-29 17:26:22',_binary '\0'),(12,1,'FH-077294-2026','SAVINGS',0.00,'USD',1,'2026-04-19 09:17:39',_binary '\0'),(15,1,'FH-716804-2026','BUSINESS',0.00,'USD',1,'2026-04-19 09:39:25',_binary '\0');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS `logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `action` varchar(200) NOT NULL,
  `details` text,
  `ip_address` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_logs_user` (`user_id`),
  CONSTRAINT `fk_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs`
--

LOCK TABLES `logs` WRITE;
/*!40000 ALTER TABLE `logs` DISABLE KEYS */;
INSERT INTO `logs` VALUES (1,4,'USER_LOGIN','Admin logged in','127.0.0.1','SUCCESS','2025-03-01 08:00:00'),(2,1,'TRANSFER','Transferred $500 to FH-100002-2025','127.0.0.1','SUCCESS','2025-03-01 09:00:00'),(3,2,'USER_REGISTER','New user jane.smith registered','127.0.0.1','SUCCESS','2025-02-28 10:00:00'),(4,1,'PASSWORD_RESET','Requested password reset','127.0.0.1','SUCCESS','2026-03-25 22:29:30'),(5,2,'LOGIN_FAILED','Wrong password attempt','127.0.0.1','FAILED','2026-03-25 22:29:30'),(6,3,'TRANSFER','Transferred $700','127.0.0.1','SUCCESS','2026-03-25 22:29:30'),(7,1,'TRANSFER','Transferred $100 from FH-100001-2025 to FH-989806-2026 | Ref: TXN-2026-49431','system','SUCCESS','2026-03-25 18:51:16'),(8,1,'TRANSFER','Transferred $150 from FH-100001-2025 to FH-989806-2026 | Ref: TXN-2026-22040','system','SUCCESS','2026-03-25 19:22:16'),(9,1,'TRANSFER','Transferred $70 from FH-100001-2025 to FH-535838-2026 | Ref: TXN-2026-88223','system','SUCCESS','2026-03-25 20:00:09'),(10,1,'TRANSFER','Transferred $100 from FH-100001-2025 to FH-100006-2025 | Ref: TXN-2026-29013','system','SUCCESS','2026-03-29 17:48:05'),(11,1,'TRANSFER','Transferred $50 from FH-100001-2025 to FH-100004-2025 | Ref: TXN-2026-52688','system','SUCCESS','2026-03-29 17:48:45'),(12,1,'TRANSFER','Transferred $100 from FH-100001-2025 to FH-535838-2026 | Ref: TXN-2026-57139','system','SUCCESS','2026-03-30 04:42:26'),(13,1,'TRANSFER','Transferred $20 from FH-100001-2025 to FH-100006-2025 | Ref: TXN-2026-69095','system','SUCCESS','2026-03-30 04:56:47'),(14,2,'TRANSFER','Transferred $60 from FH-100002-2025 to FH-100001-2025 | Ref: TXN-2026-75145','system','SUCCESS','2026-04-19 10:13:50'),(15,1,'LOGIN_SUCCESS','User logged in successfully','0:0:0:0:0:0:0:1','SUCCESS','2026-04-20 18:34:29'),(16,1,'TRANSFER','Transferred $50 from FH-100001-2025 to FH-100003-2025 | Ref: TXN-2026-50130','0:0:0:0:0:0:0:1','SUCCESS','2026-04-20 18:38:04'),(17,4,'LOGIN_SUCCESS','User logged in successfully','0:0:0:0:0:0:0:1','SUCCESS','2026-04-21 00:11:13'),(18,1,'LOGIN_SUCCESS','User logged in successfully','0:0:0:0:0:0:0:1','SUCCESS','2026-04-21 00:27:05'),(19,4,'LOGIN_SUCCESS','User logged in successfully','0:0:0:0:0:0:0:1','SUCCESS','2026-04-21 00:40:57'),(20,1,'LOGIN_SUCCESS','User logged in successfully','0:0:0:0:0:0:0:1','SUCCESS','2026-04-21 00:41:15'),(21,1,'SUSPICIOUS_ACTIVITY','Transaction flagged as suspicious (Risk Heuristics) | Ref: TXN-2026-59714','0:0:0:0:0:0:0:1','WARNING','2026-04-21 00:43:20'),(22,4,'LOGIN_SUCCESS','User logged in successfully','0:0:0:0:0:0:0:1','SUCCESS','2026-04-21 00:44:19'),(23,1,'SUSPICIOUS_ACTIVITY','Transaction flagged as suspicious (Risk Heuristics) | Ref: TXN-2026-10836','0:0:0:0:0:0:0:1','WARNING','2026-04-21 00:45:50'),(24,1,'LOGIN_SUCCESS','User logged in successfully','0:0:0:0:0:0:0:1','SUCCESS','2026-04-21 00:46:51'),(25,1,'LOGIN_SUCCESS','User logged in successfully','0:0:0:0:0:0:0:1','SUCCESS','2026-04-21 00:48:02'),(26,1,'TRANSFER','Transferred $1 from FH-100001-2025 to FH-100002-2025 | Ref: TXN-2026-29117','0:0:0:0:0:0:0:1','SUCCESS','2026-04-21 00:48:40'),(27,1,'TRANSFER','Transferred $1 from FH-100001-2025 to FH-100003-2025 | Ref: TXN-2026-20760','0:0:0:0:0:0:0:1','SUCCESS','2026-04-21 00:48:49'),(28,1,'TRANSFER','Transferred $1 from FH-100001-2025 to FH-100004-2025 | Ref: TXN-2026-54843','0:0:0:0:0:0:0:1','SUCCESS','2026-04-21 00:48:53'),(29,1,'SUSPICIOUS_ACTIVITY','Transaction flagged as suspicious (Risk Heuristics) | Ref: TXN-2026-01427','0:0:0:0:0:0:0:1','WARNING','2026-04-21 00:48:57'),(30,1,'SUSPICIOUS_ACTIVITY','Transaction flagged as suspicious (Risk Heuristics) | Ref: TXN-2026-82804','0:0:0:0:0:0:0:1','WARNING','2026-04-21 00:49:02'),(31,8,'LOGIN_SUCCESS','User logged in successfully','0:0:0:0:0:0:0:1','SUCCESS','2026-04-21 00:51:51'),(32,8,'SUSPICIOUS_ACTIVITY','Transaction flagged as suspicious (Risk Heuristics) | Ref: TXN-2026-51537','0:0:0:0:0:0:0:1','WARNING','2026-04-21 00:52:22'),(33,1,'LOGIN_SUCCESS','User logged in successfully','0:0:0:0:0:0:0:1','SUCCESS','2026-04-21 01:07:20'),(34,1,'LOGIN_SUCCESS','User logged in successfully','0:0:0:0:0:0:0:1','SUCCESS','2026-04-21 01:20:29');
/*!40000 ALTER TABLE `logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `fk_prt_user` (`user_id`),
  CONSTRAINT `fk_prt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES (19,8,'413f5240-752b-4d85-8d52-cd22567a1a90','2026-03-25 19:14:23',0,'2026-03-25 18:44:23'),(21,1,'e163b9b9-fcd8-43d5-ba3d-31a281fe92a4','2026-03-25 19:49:51',1,'2026-03-25 19:19:51'),(22,6,'44e874f8-eb48-4f7a-b719-8be4acc51595','2026-03-29 18:25:19',1,'2026-03-29 17:55:19');
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (3,'ADMIN'),(4,'AUDITOR'),(1,'CUSTOMER'),(2,'EMPLOYEE');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sender_account_id` bigint DEFAULT NULL,
  `receiver_account_id` bigint DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `transaction_type` enum('TRANSFER','DEPOSIT','WITHDRAWAL') NOT NULL,
  `status` enum('PENDING','COMPLETED','FAILED','SUSPICIOUS') NOT NULL DEFAULT 'PENDING',
  `description` varchar(500) DEFAULT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `category` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_txn_sender` (`sender_account_id`),
  KEY `fk_txn_receiver` (`receiver_account_id`),
  CONSTRAINT `fk_txn_receiver` FOREIGN KEY (`receiver_account_id`) REFERENCES `accounts` (`id`),
  CONSTRAINT `fk_txn_sender` FOREIGN KEY (`sender_account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,1,2,500.00,'TRANSFER','COMPLETED','Rent payment','TXN-2025-00001','2025-03-01 09:00:00',NULL),(2,2,1,200.00,'TRANSFER','COMPLETED','Refund','TXN-2025-00002','2025-03-05 14:30:00',NULL),(3,1,3,1000.00,'TRANSFER','COMPLETED','Investment deposit','TXN-2025-00003','2025-03-10 11:00:00',NULL),(4,3,1,250.00,'TRANSFER','PENDING','Dividend payout','TXN-2025-00004','2025-03-15 16:45:00',NULL),(5,2,3,100.00,'TRANSFER','PENDING','Savings transfer','TXN-2025-00005','2025-03-20 08:20:00',NULL),(6,1,4,300.00,'TRANSFER','COMPLETED','Utility payment','TXN-2025-00006','2026-03-25 22:29:20',NULL),(7,4,2,1500.00,'TRANSFER','COMPLETED','Salary credit','TXN-2025-00007','2026-03-25 22:29:20',NULL),(8,6,1,200.00,'TRANSFER','FAILED','Test failure','TXN-2025-00008','2026-03-25 22:29:20',NULL),(9,5,3,700.00,'TRANSFER','COMPLETED','Investment','TXN-2025-00009','2026-03-25 22:29:20',NULL),(10,1,7,100.00,'TRANSFER','COMPLETED','dinner','TXN-2026-49431','2026-03-25 18:51:16',NULL),(11,1,7,150.00,'TRANSFER','COMPLETED','shopping','TXN-2026-22040','2026-03-25 19:22:16',NULL),(12,1,8,70.00,'TRANSFER','COMPLETED','Fund Transfer','TXN-2026-88223','2026-03-25 20:00:09',NULL),(13,1,6,100.00,'TRANSFER','COMPLETED','brunch','TXN-2026-29013','2026-03-29 17:48:05',NULL),(14,1,4,50.00,'TRANSFER','COMPLETED','Quick Transfer','TXN-2026-52688','2026-03-29 17:48:45',NULL),(15,1,8,100.00,'TRANSFER','COMPLETED','education','TXN-2026-57139','2026-03-30 04:42:26',NULL),(16,1,6,20.00,'TRANSFER','COMPLETED','Quick Transfer','TXN-2026-69095','2026-03-30 04:56:47',NULL),(17,2,1,60.00,'TRANSFER','COMPLETED','P2P Payment via QR','TXN-2026-75145','2026-04-19 10:13:50',NULL),(18,1,3,50.00,'TRANSFER','COMPLETED','Quick Transfer','TXN-2026-50130','2026-04-20 18:38:04',NULL),(19,NULL,1,5000.00,'TRANSFER','COMPLETED','April Salary Credit','TXN-2026-APR-01','2026-04-21 00:24:06',NULL),(20,1,NULL,1200.00,'TRANSFER','COMPLETED','Apartment Rent','TXN-2026-APR-02','2026-04-21 00:24:17',NULL),(21,1,NULL,150.75,'TRANSFER','COMPLETED','Supermarket Groceries','TXN-2026-APR-03','2026-04-21 00:24:26',NULL),(22,1,8,10001.00,'TRANSFER','FAILED','education','TXN-2026-59714','2026-04-21 00:43:20',NULL),(24,1,2,1.00,'TRANSFER','COMPLETED','Quick Transfer','TXN-2026-29117','2026-04-21 00:48:40',NULL),(25,1,3,1.00,'TRANSFER','COMPLETED','Quick Transfer','TXN-2026-20760','2026-04-21 00:48:49',NULL),(26,1,4,1.00,'TRANSFER','COMPLETED','Quick Transfer','TXN-2026-54843','2026-04-21 00:48:53',NULL),(27,1,5,1.00,'TRANSFER','FAILED','Quick Transfer','TXN-2026-01427','2026-04-21 00:48:57',NULL),(28,1,6,1.00,'TRANSFER','FAILED','Quick Transfer','TXN-2026-82804','2026-04-21 00:49:02',NULL),(29,8,1,10001.00,'TRANSFER','COMPLETED','education','TXN-2026-51537','2026-04-21 00:52:22',NULL);
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(200) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role_id` bigint NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_users_role` (`role_id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'john.doe','john.doe@financehub.com','$2a$10$ASi8TZEkLe62gEQyYhYtG.zKEYU81b1fV1Fbp/bbHYPlPYvwq9Lzy','John Doe','+1-555-0101',1,1,'2026-03-25 02:38:19'),(2,'jane.smith','jane.smith@financehub.com','$2a$10$JKl7MW22HPgvc0EvkOKMzOpeRf0iJ0XmjH2K5FjE7kBK1ngWDCbne','Jane Smith','',1,1,'2026-03-25 02:38:19'),(3,'emp.user','emp.user@financehub.com','$2a$10$krc3/iWvcpR3Jw4IAteLCuC6noO66fEOH0RIh3WCkdLX4phxbIjwe','Emily Carter','+1-555-0103',2,1,'2026-03-25 02:38:19'),(4,'admin.user','admin.user@financehub.com','$2a$10$JajhJDYZ6LhbJEEvLysTXOKsjfnpEd1wpYX6M9eG6JZAAnoJcItRy','Admin User','+1-555-0104',3,1,'2026-03-25 02:38:19'),(5,'audit.user','audit.user@financehub.com','$2a$10$6Z89jghH2gh49fcHgwS49OvHuRV/L/rMbb3f4OAQqABedj4pwO2Zi','Auditor Morgan','+1-555-0105',4,1,'2026-03-25 02:38:19'),(6,'roshni.gupta','roshni.gupta@financehub.com','$2a$10$uuLq/21HS6lreRawWahdguoAHiSRdSRYuIsiKbcaQg/lpW5n5ZxpS','Roshni Gupta','+1-555-0106',1,1,'2026-03-25 02:38:19'),(7,'testuser','test@example.com','$2a$10$qbYU2fmLI3xD45DnKXB4geihiAfqFP3ZQKSlC/bSpT9q/J/WCSU2a','Test User','+1234567890',1,1,'2026-03-25 17:33:51'),(8,'alice.kumar','alice.kumar@financehub.com','$2a$10$sWzuyVpSKy3y/SyQwFT5Teg.vU2/27oOCONXKgEArMokM4.lkMV4a','Alice kumar','+1-555-0107',1,1,'2026-03-25 18:34:41'),(9,'unique123','unique@test.com','$2a$10$aKOlt92pMktYqxLdOoT.1.H0XgkKSDQ/n0rtfkl9Ui/5vVZvq/9ru','Unique User','+1-555-9999',1,1,'2026-03-29 17:12:14'),(10,'tester_v3','tester_v3@example.com','$2a$10$xFOZS6JNS56MYMVHPcITlOTsSNilNcQyrqh5V5DtsAnVnujq/Fg0W','Tester V3','+1-555-0101',1,1,'2026-03-29 17:26:22');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-21 22:55:12
