-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: utn_asesorias
-- ------------------------------------------------------
-- Server version	8.0.34

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
-- Table structure for table `asignaciones_tutor`
--

DROP TABLE IF EXISTS `asignaciones_tutor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignaciones_tutor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `docente_id` int NOT NULL,
  `alumno_id` int NOT NULL,
  `periodo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `asignado_por` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_asignacion` (`docente_id`,`alumno_id`,`periodo`),
  KEY `asignado_por` (`asignado_por`),
  KEY `idx_alumno` (`alumno_id`),
  KEY `idx_docente` (`docente_id`),
  CONSTRAINT `asignaciones_tutor_ibfk_1` FOREIGN KEY (`docente_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `asignaciones_tutor_ibfk_2` FOREIGN KEY (`alumno_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `asignaciones_tutor_ibfk_3` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones_tutor`
--

LOCK TABLES `asignaciones_tutor` WRITE;
/*!40000 ALTER TABLE `asignaciones_tutor` DISABLE KEYS */;
/*!40000 ALTER TABLE `asignaciones_tutor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `accion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tabla_afectada` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registro_id` int DEFAULT NULL,
  `datos_anteriores` json DEFAULT NULL,
  `datos_nuevos` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_accion` (`accion`),
  KEY `idx_fecha` (`created_at`),
  CONSTRAINT `audit_log_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
INSERT INTO `audit_log` VALUES (1,1,'LOGIN',NULL,NULL,NULL,NULL,'::1','2026-04-13 07:08:03'),(2,1,'LOGIN',NULL,NULL,NULL,NULL,'::1','2026-04-13 08:31:41'),(3,1,'LOGIN',NULL,NULL,NULL,NULL,'::1','2026-04-13 08:42:32'),(4,1,'LOGIN',NULL,NULL,NULL,NULL,'::1','2026-04-13 08:50:14'),(5,1,'REGISTRO_USUARIO','usuarios',4,NULL,NULL,'::1','2026-04-13 09:23:17'),(6,1,'DESACTIVAR_USUARIO','usuarios',4,NULL,NULL,'::1','2026-04-13 09:23:48'),(7,1,'REGISTRO_USUARIO','usuarios',5,NULL,NULL,'::1','2026-04-13 09:24:37'),(8,1,'REGISTRO_USUARIO','usuarios',6,NULL,NULL,'::1','2026-04-13 09:25:14'),(9,1,'LOGIN',NULL,NULL,NULL,NULL,'::1','2026-04-13 09:58:17'),(10,1,'LOGIN',NULL,NULL,NULL,NULL,'::1','2026-04-13 09:58:23'),(11,1,'LOGIN',NULL,NULL,NULL,NULL,'::1','2026-04-13 09:58:56');
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avances_alumno`
--

DROP TABLE IF EXISTS `avances_alumno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avances_alumno` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sesion_id` int NOT NULL,
  `alumno_id` int NOT NULL,
  `docente_id` int NOT NULL,
  `temas_vistos` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `nivel_comprension` enum('bajo','medio','alto') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medio',
  `compromisos` text COLLATE utf8mb4_unicode_ci,
  `recursos_compartidos` text COLLATE utf8mb4_unicode_ci,
  `proximos_temas` text COLLATE utf8mb4_unicode_ci,
  `calificacion_sesion` tinyint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_avance_sesion` (`sesion_id`),
  KEY `alumno_id` (`alumno_id`),
  KEY `docente_id` (`docente_id`),
  CONSTRAINT `avances_alumno_ibfk_1` FOREIGN KEY (`sesion_id`) REFERENCES `sesiones_tutoria` (`id`) ON DELETE CASCADE,
  CONSTRAINT `avances_alumno_ibfk_2` FOREIGN KEY (`alumno_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `avances_alumno_ibfk_3` FOREIGN KEY (`docente_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `avances_alumno_chk_1` CHECK ((`calificacion_sesion` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avances_alumno`
--

LOCK TABLES `avances_alumno` WRITE;
/*!40000 ALTER TABLE `avances_alumno` DISABLE KEYS */;
/*!40000 ALTER TABLE `avances_alumno` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `justificantes`
--

DROP TABLE IF EXISTS `justificantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `justificantes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `sesion_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `tipo` enum('inasistencia_alumno','inasistencia_docente','reprogramacion','otro') COLLATE utf8mb4_unicode_ci NOT NULL,
  `motivo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `archivo_nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `archivo_ruta` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('pendiente','aprobado','rechazado') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `revisado_por` int DEFAULT NULL,
  `notas_revision` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `sesion_id` (`sesion_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `revisado_por` (`revisado_por`),
  CONSTRAINT `justificantes_ibfk_1` FOREIGN KEY (`sesion_id`) REFERENCES `sesiones_tutoria` (`id`) ON DELETE CASCADE,
  CONSTRAINT `justificantes_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `justificantes_ibfk_3` FOREIGN KEY (`revisado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `justificantes`
--

LOCK TABLES `justificantes` WRITE;
/*!40000 ALTER TABLE `justificantes` DISABLE KEYS */;
/*!40000 ALTER TABLE `justificantes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesiones_tutoria`
--

DROP TABLE IF EXISTS `sesiones_tutoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesiones_tutoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `docente_id` int NOT NULL,
  `alumno_id` int NOT NULL,
  `fecha_programada` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `modalidad` enum('presencial','virtual') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'presencial',
  `lugar_enlace` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('programada','pendiente_confirmacion','confirmada','completada','cancelada','no_presentado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'programada',
  `temas_propuestos` text COLLATE utf8mb4_unicode_ci,
  `observaciones_docente` text COLLATE utf8mb4_unicode_ci,
  `observaciones_alumno` text COLLATE utf8mb4_unicode_ci,
  `codigo_confirmacion` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_expira_at` timestamp NULL DEFAULT NULL,
  `codigo_usado` tinyint(1) DEFAULT '0',
  `confirmada_por_alumno` tinyint(1) DEFAULT '0',
  `confirmada_por_docente` tinyint(1) DEFAULT '0',
  `fecha_confirmacion` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `idx_docente` (`docente_id`),
  KEY `idx_alumno` (`alumno_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha` (`fecha_programada`),
  CONSTRAINT `sesiones_tutoria_ibfk_1` FOREIGN KEY (`docente_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `sesiones_tutoria_ibfk_2` FOREIGN KEY (`alumno_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones_tutoria`
--

LOCK TABLES `sesiones_tutoria` WRITE;
/*!40000 ALTER TABLE `sesiones_tutoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `sesiones_tutoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_paterno` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_materno` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('alumno','docente','administrador') COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_control` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_empleado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `carrera` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `semestre` tinyint unsigned DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `numero_control` (`numero_control`),
  UNIQUE KEY `numero_empleado` (`numero_empleado`),
  KEY `idx_email` (`email`),
  KEY `idx_rol` (`rol`),
  KEY `idx_uuid` (`uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'156512aa-36cf-11f1-95c5-581122b9105c','Administrador','UTN','Sistema','admin@utn.edu.mx','$2a$12$gelZkXVNMWZNFnUoc0PNCu5Klfdv7OZvQ1SL6tWfhT79xWws57n7W','administrador',NULL,'ADM001',NULL,NULL,1,'2026-04-13 00:24:07','2026-04-13 07:07:24'),(3,'156512aa-36cf-f11f-95c5-581122b9105c','Administrator','Luis','Sistema','luis@utn.edu.mx','123456','administrador','','ADM002','Sistemas',NULL,1,'2026-04-13 06:42:10','2026-04-13 06:49:29'),(4,'72cfb9a2-5c0a-4fe4-afb9-041f6b19a4e3','Luis','Gomez','Nava','luisdocente3@utn.edu.mx','$2a$12$75d/Q9zqyL5Dt/t0uHJAG.wfmV2xmIRuI.tSpJ1rMIvVUyFDUQ8D2','alumno',NULL,NULL,NULL,NULL,0,'2026-04-13 09:23:17','2026-04-13 09:23:48'),(5,'1a441122-bd7e-4eb6-82f8-2ac45b22e110','Luis','Gomez','Nava','luisdocente@utn.edu.mx','$2a$12$av2U.u6en/yXFXXKcPGdeOrFGQpCHzTsdde9gF4adJV.T9t27Bqom','docente',NULL,'DOC001',NULL,NULL,1,'2026-04-13 09:24:37','2026-04-13 09:24:37'),(6,'b75c6671-9c3f-4510-9fd3-5fe535cecd74','Luis','aLUMNO','NAVA','luisalumno@utn.edu.mx','$2a$12$o8uVFoI12xGscwdmDRwMcudzfR0UQRJjkzQLPGS.DlPCLhLUBgJJ6','alumno','310040',NULL,'IDGS',8,1,'2026-04-13 09:25:14','2026-04-13 09:25:14');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'utn_asesorias'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-13  3:04:27
