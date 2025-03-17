document.addEventListener("DOMContentLoaded", function () {
    window.jsPDF = window.jspdf.jsPDF;
});

function generarPDF() {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const logoInput = document.getElementById("logoInput").files[0];

    // Función para generar el encabezado con el logo a la izquierda
    function generateHeader(withLogo, logoDataUrl) {
        // Fondo del encabezado
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, 210, 30, 'F');

        if (withLogo && logoDataUrl) {
            // Agrega el logo circular en la parte izquierda (20x20 mm)
            doc.addImage(logoDataUrl, "PNG", 10, 5, 20, 20);
            // Título posicionado a la derecha del logo
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.setTextColor(255, 255, 255);
            doc.text("INFORME TÉCNICO DE EQUIPO", 35, 18, { align: "left" });
        } else {
            // Sin logo: título centrado
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.setTextColor(255, 255, 255);
            doc.text("INFORME TÉCNICO DE EQUIPO", 105, 18, { align: "center" });
        }
    }

    let y = 35; // posición inicial después del encabezado

    // Funciones para agregar contenido al PDF
    function addSectionTitle(title) {
        doc.setFillColor(50, 50, 50); // Gris oscuro
        doc.rect(10, y, 190, 10, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text(title, 15, y + 7);
        y += 15;
    }

    function addTextLine(label, text) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(200, 0, 0); // Rojo para la etiqueta
        doc.text(label + ":", 15, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0); // Negro para el contenido
        doc.text(text, 60, y, { maxWidth: 130 });
        y += 8;
    }

    function addMultilineText(label, text) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(200, 0, 0);
        doc.text(label + ":", 15, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        y += 6;
        const lines = doc.splitTextToSize(text, 170);
        doc.text(lines, 20, y);
        y += lines.length * 8 + 2;
    }

    function checkPageBreak(height) {
        if (y + height > 285) { // Dejamos margen para el pie de página
            doc.addPage();
            y = 20;
        }
    }

    // Función para crear una versión circular del logo usando Canvas
    function makeCircularImage(img, canvasSize, callback) {
        const canvas = document.createElement("canvas");
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        const ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        const iw = img.width, ih = img.height;
        const aspect = iw / ih;
        let drawWidth, drawHeight, offsetX, offsetY;
        if (aspect > 1) {
            drawHeight = canvasSize;
            drawWidth = canvasSize * aspect;
            offsetX = -(drawWidth - canvasSize) / 2;
            offsetY = 0;
        } else {
            drawWidth = canvasSize;
            drawHeight = canvasSize / aspect;
            offsetX = 0;
            offsetY = -(drawHeight - canvasSize) / 2;
        }
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        // Borde elegante alrededor del logo circular
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgb(200,200,200)";
        ctx.beginPath();
        ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2 - 2, 0, Math.PI * 2);
        ctx.stroke();

        callback(canvas.toDataURL("image/png"));
    }

    // Procesa el logo si se carga y genera el encabezado; de lo contrario, genera el encabezado sin logo.
    if (logoInput) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function () {
                // Creamos una imagen circular usando un canvas de 100x100 px,
                // luego se escalará a 20x20 mm en el PDF.
                makeCircularImage(img, 100, function (circularDataUrl) {
                    generateHeader(true, circularDataUrl);
                    generateContent();
                });
            };
        };
        reader.readAsDataURL(logoInput);
    } else {
        generateHeader(false, null);
        generateContent();
    }

    // Función principal que genera el contenido del PDF
    function generateContent() {
        checkPageBreak(20);
        addSectionTitle("Datos Generales");
        checkPageBreak(20);
        addTextLine("Fecha", document.getElementById("fecha").value);
        addTextLine("Cliente", document.getElementById("cliente").value);
        addTextLine("Contacto", document.getElementById("contacto").value);

        checkPageBreak(30);
        addSectionTitle("Datos del Equipo");
        checkPageBreak(30);
        addTextLine("Tipo de equipo", document.getElementById("equipo").value);
        addTextLine("Marca y modelo", document.getElementById("modelo").value);
        addTextLine("Tipo de Disco", document.getElementById("tipoDisco").value);
        addTextLine("Almacenamiento", document.getElementById("almacenamiento").value);
        addTextLine("Memoria RAM", document.getElementById("ram").value);

        checkPageBreak(40);
        addSectionTitle("Detalles Técnicos");
        checkPageBreak(40);
        addMultilineText("Descripción del Problema", document.getElementById("problema").value);
        addMultilineText("Diagnóstico", document.getElementById("diagnostico").value);
        addMultilineText("Procedimientos Realizados", document.getElementById("procedimientos").value);
        addMultilineText("Recomendaciones", document.getElementById("recomendaciones").value);
        addTextLine("Garantía", document.getElementById("garantia").value);

        // Pie de página: Fondo negro con tres líneas de texto centrado
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 285, 210, 12, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text("Derechos Reservados Grizzder Technology", 105, 288, { align: "center" });
        doc.text("Contactanos 3016872575 - 3222668924", 105, 292, { align: "center" });
        doc.text("Siguenos en nuestras redes sociales Grizzder Technology", 105, 296, { align: "center" });

        doc.save(`Informe_${document.getElementById("cliente").value}.pdf`);
    }
}
