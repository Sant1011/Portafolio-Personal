const http = require('http');

const PUERTO = 80;
const NOTA_MINIMA = 3.0;
const notasDelCurso = [4.5, 3.5, 2.5, 4.0];
const datosEquipo = { equipo: 'Equipo NN', integrantes: ['Nombre Uno', 'Nombre Dos'] };

function calcularPromedio(notas) {
  return notas.reduce((suma, n) => suma + n, 0) / notas.length;
}

function estaAprobado(promedio) {
  return promedio >= NOTA_MINIMA;
}

function responder(res, codigo, datos) {
  res.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(datos, null, 2));
}

function manejarNotas(res) {
  const promedio = calcularPromedio(notasDelCurso);
  responder(res, 200, { promedio, aprobado: estaAprobado(promedio) });
}

const servidor = http.createServer((req, res) => {
  if (req.url === '/salud') return responder(res, 200, { estado: 'ok' });
  if (req.url === '/equipo') return responder(res, 200, datosEquipo);
  if (req.url === '/notas') return manejarNotas(res);
  responder(res, 404, { error: 'Ruta no encontrada' });
});

servidor.listen(PUERTO);