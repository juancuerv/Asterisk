-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 10-12-2022 a las 03:15:45
-- Versión del servidor: 10.4.16-MariaDB
-- Versión de PHP: 7.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `mundialFutbol`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `apuestas`
--

CREATE TABLE `apuestas` (
  `id_apuesta` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_partido` int(11) DEFAULT NULL,
  `goles_local` int(11) DEFAULT NULL,
  `goles_visitante` int(11) DEFAULT NULL,
  `monto` int(11) DEFAULT NULL,
  `fecha_apuesta` date DEFAULT NULL,
  `jugado` int(11) DEFAULT NULL,
  `pagado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `apuestas`
--

INSERT INTO `apuestas` (`id_apuesta`, `id_usuario`, `id_partido`, `goles_local`, `goles_visitante`, `monto`, `fecha_apuesta`, `jugado`, `pagado`) VALUES
(1, 1, 1, 2, 2, 5000, '2022-12-07', 2, 0),
(2, 2, 1, 2, 3, 10000, '2022-12-07', 1, 0),
(3, 1, 2, 5, 5, 2000, '2022-12-04', 1, 0),
(4, 2, 2, 1, 1, 100, '2022-12-04', 2, 0),
(5, 1, 3, 2, 2, 50, '2022-12-06', 0, 0),
(6, 2, 3, 0, 0, 1000, '2022-12-06', 0, 0),
(7, 1, 3, 1, 2, 6000, '2022-12-09', 0, 0),
(8, 2, 3, 3, 3, 5000, '2022-12-09', 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partidos`
--

CREATE TABLE `partidos` (
  `id_partido` int(11) NOT NULL,
  `local` varchar(50) DEFAULT NULL,
  `visitante` varchar(50) DEFAULT NULL,
  `fecha_partido` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `partidos`
--

INSERT INTO `partidos` (`id_partido`, `local`, `visitante`, `fecha_partido`) VALUES
(1, 'Paìses Bajos', 'Argentina', '2022-12-09'),
(2, 'Croacia', 'Brasil', '2022-12-09'),
(3, 'Inglaterra', 'Francia', '2022-12-10'),
(4, 'Marruecos', 'Portugal', '2022-12-10'),
(5, 'Argentina', 'Croacia', '2022-12-13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resultados_partido`
--

CREATE TABLE `resultados_partido` (
  `id_resultado` int(11) NOT NULL,
  `id_partido` int(11) DEFAULT NULL,
  `goles_local` int(11) DEFAULT NULL,
  `goles_visitante` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `resultados_partido`
--

INSERT INTO `resultados_partido` (`id_resultado`, `id_partido`, `goles_local`, `goles_visitante`) VALUES
(1, 1, 2, 2),
(2, 2, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `cedula` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `cedula`) VALUES
(1, 123),
(2, 456),
(3, 789);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `apuestas`
--
ALTER TABLE `apuestas`
  ADD PRIMARY KEY (`id_apuesta`),
  ADD KEY `FK_REFERENCE_1` (`id_usuario`),
  ADD KEY `FK_REFERENCE_2` (`id_partido`);

--
-- Indices de la tabla `partidos`
--
ALTER TABLE `partidos`
  ADD PRIMARY KEY (`id_partido`);

--
-- Indices de la tabla `resultados_partido`
--
ALTER TABLE `resultados_partido`
  ADD PRIMARY KEY (`id_resultado`),
  ADD KEY `FK_REFERENCE_3` (`id_partido`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `apuestas`
--
ALTER TABLE `apuestas`
  MODIFY `id_apuesta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `partidos`
--
ALTER TABLE `partidos`
  MODIFY `id_partido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `resultados_partido`
--
ALTER TABLE `resultados_partido`
  MODIFY `id_resultado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `apuestas`
--
ALTER TABLE `apuestas`
  ADD CONSTRAINT `FK_REFERENCE_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `FK_REFERENCE_2` FOREIGN KEY (`id_partido`) REFERENCES `partidos` (`id_partido`);

--
-- Filtros para la tabla `resultados_partido`
--
ALTER TABLE `resultados_partido`
  ADD CONSTRAINT `FK_REFERENCE_3` FOREIGN KEY (`id_partido`) REFERENCES `partidos` (`id_partido`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
