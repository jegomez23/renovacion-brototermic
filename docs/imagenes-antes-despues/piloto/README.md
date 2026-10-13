# Piloto: propuestas IA rechazadas

Se produjeron tres propuestas reales y se **rechazan las tres**. No se sustituye ninguna fotografía en images/ ni legacy/. Las fuentes PNG generadas se conservan en fuentes/ y los JPG históricos se copian byte a byte solo en esta carpeta de documentación.

Abrir index.html para la comparación a tamaño real. Cada informe JSON registra dimensiones, bytes y SHA-256 de fuentes, derivados, máscara y mapas.

Reproducir desde el repositorio (sips, cwebp, dwebp y djpeg deben estar disponibles fuera de npm):

```sh
node tools/comparar-retoques-piloto.js --fuentes=docs/imagenes-antes-despues/piloto/fuentes
```

La propuesta se normaliza con sips al cuadro completo 260 × 168, sin recorte ni registro geométrico; si su proporción difiere, se fuerza para esta comparación y no se oculta ese hecho. Se conserva PNG normalizado antes de JPEG. Los mapas muestran diferencia máxima por canal (0 negro, 255 blanco), sin amplificar. El mapa de exportación compara PNG normalizado con su JPG calidad 90 para separar pérdida de codificación.

La máscara rectangular es conservadora, contiene fondo y **no es segmentación exacta**. No se puede concluir que todos sus píxeles diferentes sean cambios del producto: hay diferencias del fondo y del remuestreo. El rechazo está motivado también por inspección visual de fuentes: son recreaciones generativas de tubos, bridas, cajas, mangos y reflejos, con resolución ampliada; no simples cambios del fondo.

No se acredita aprobación comercial, conservación exacta de píxeles del producto, ni test/build/Lighthouse. El script se ejecutó para producir las evidencias de esta carpeta y verificó tamaños 260 × 168, cambios en zona protegida > 0 y hashes intactos de las fuentes durante la ejecución.
