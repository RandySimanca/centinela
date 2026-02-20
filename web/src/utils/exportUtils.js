import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Exporta el reporte detallado a un archivo Excel (.xlsx)
 */
export const exportToExcel = (data) => {
    const { stats, candidates, conteos, puestos, mesas, usuarios = [] } = data;

    const getUserName = (uid) => {
        const user = usuarios.find(u => u.id === uid);
        return user ? user.nombre : uid;
    };

    // 1. Hoja de Resumen General
    const resumenData = candidates.map((cand, index) => ({
        '#': index + 1,
        'Candidato': cand.nombre,
        'Partido': cand.partido,
        'Votos': stats?.porCandidato?.[cand.id] || 0,
        '%': stats?.totalVotos > 0
            ? ((stats.porCandidato?.[cand.id] || 0) / stats.totalVotos * 100).toFixed(2) + '%'
            : '0.00%'
    }));

    resumenData.push({
        '#': '',
        'Candidato': 'TOTAL VOTOS VÁLIDOS',
        'Partido': '',
        'Votos': stats?.totalVotos || 0,
        '%': '100%'
    });

    // 2. Hoja de Detalle de Mesas (Auditoría Técnica)
    const detalleData = conteos.map(conteo => {
        const puesto = puestos.find(p => p.id === conteo.puestoId);
        const mesa = mesas.find(m => m.id === conteo.mesaId);

        const row = {
            'Puesto de Votación': puesto?.nombre || 'Desconocido',
            'Mesa': mesa?.numero || 'N/A',
            'ID Global': mesa?.numeroGlobal || '',
            'Habilitados (E-11)': conteo.votantesFQ11 || 0,
            'Votos en Urna': conteo.votosUrna || 0,
            'Incinerados': conteo.votosIncinerados || 0,
            'Urna Normalizada': (conteo.votosUrna - conteo.votosIncinerados) || 0,
            'Suma E-14': conteo.sumaTotal || 0
        };

        // Agregar votos por cada candidato de forma dinámica
        candidates.forEach(cand => {
            row[cand.nombre] = conteo.porCandidato?.[cand.id] || 0;
        });

        row['Blanco'] = conteo.votosBlanco || 0;
        row['Nulos'] = conteo.votosNulos || 0;
        row['No Marcados'] = conteo.votosNoMarcados || 0;
        row['Nombre del Testigo'] = conteo.reportadoPorNombre || getUserName(conteo.reportadoPor) || 'Desconocido';
        row['Fecha/Hora Reporte'] = conteo.timestamp ? new Date(conteo.timestamp).toLocaleString() : '';

        return row;
    });

    // Crear el libro de trabajo (Workbook)
    const wb = XLSX.utils.book_new();

    const wsResumen = XLSX.utils.json_to_sheet(resumenData);
    const wsDetalle = XLSX.utils.json_to_sheet(detalleData);

    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen General");
    XLSX.utils.book_append_sheet(wb, wsDetalle, "Auditoría de Mesas");

    // Guardar archivo
    const fileName = `Reporte_Electoral_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
};

/**
 * Exporta un reporte ejecutivo a PDF
 */
export const exportToPDF = (data) => {
    try {
        const { stats, candidates, municipioNombre = "Pueblo Nuevo", usuarios = [] } = data;

        const getUserName = (uid) => {
            const user = usuarios.find(u => u.id === uid);
            return user ? user.nombre : uid;
        };

        const doc = new jsPDF();

        // Título y Encabezado
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text(`REPORTE DE RESULTADOS ELECTORALES`, 105, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.text(municipioNombre.toUpperCase(), 105, 30, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 105, 38, { align: 'center' });

        // Línea separadora
        doc.line(20, 42, 190, 42);

        // Resumen Estadístico
        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.text("RESUMEN DE PARTICIPACIÓN", 20, 52);

        const totalMesas = stats?.totalMesas || 0;
        const mesasInf = stats?.mesasContabilizadas || 0;
        const avance = totalMesas > 0 ? (mesasInf / totalMesas * 100).toFixed(2) : 0;

        const statsTable = [
            ["Total Votos Procesados", (stats?.totalVotos || 0).toLocaleString()],
            ["Mesas Informadas", `${mesasInf} de ${totalMesas} (${avance}%)`],
            ["Votos en Blanco", (stats?.votosBlanco || 0).toLocaleString()],
            ["Votos Nulos", (stats?.votosNulos || 0).toLocaleString()]
        ];

        autoTable(doc, {
            startY: 55,
            head: [['Concepto', 'Valor']],
            body: statsTable,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] }
        });

        // Tabla de Candidatos
        const candidatesY = doc.lastAutoTable.finalY + 15;
        doc.text("RESULTADOS POR CANDIDATO", 20, candidatesY);

        const candidatesRows = candidates.map((cand, index) => {
            const votos = stats?.porCandidato?.[cand.id] || 0;
            const porcentaje = stats?.totalVotos > 0
                ? (votos / stats.totalVotos * 100).toFixed(2) + '%'
                : '0.00%';
            return [index + 1, cand.nombre, cand.partido, votos.toLocaleString(), porcentaje];
        }).sort((a, b) => parseInt(b[3].replace(/,/g, '')) - parseInt(a[3].replace(/,/g, '')));

        autoTable(doc, {
            startY: candidatesY + 5,
            head: [['Pos', 'Candidato', 'Movimiento / Partido', 'Votos', '%']],
            body: candidatesRows,
            theme: 'striped',
            headStyles: { fillColor: [31, 41, 55] }
        });

        // 3. DETALLE POR MESA (NUEVA PÁGINA)
        if (data.conteos && data.conteos.length > 0) {
            doc.addPage();
            doc.setFontSize(14);
            doc.text("DETALLE TÉCNICO POR MESA (AUDITORÍA)", 105, 15, { align: 'center' });

            const candidateHeaderNames = candidates.map(c => c.nombre);
            const detailHeaders = [['Puesto', 'Mesa', ...candidateHeaderNames, 'Blanco', 'Nulos', 'Total', 'Testigo']];

            const detailRows = data.conteos.map(conteo => {
                const puesto = data.puestos?.find(p => p.id === conteo.puestoId);
                const mesa = data.mesas?.find(m => m.id === conteo.mesaId);

                const candVotos = candidates.map(c => (conteo.porCandidato?.[c.id] || 0).toLocaleString());

                return [
                    puesto?.nombre || 'N/A',
                    mesa?.numero || 'N/A',
                    ...candVotos,
                    (conteo.votosBlanco || 0).toLocaleString(),
                    (conteo.votosNulos || 0).toLocaleString(),
                    (conteo.sumaTotal || 0).toLocaleString(),
                    conteo.reportadoPorNombre || getUserName(conteo.reportadoPor) || 'N/A'
                ];
            }).sort((a, b) => a[0].localeCompare(b[0]) || a[1] - b[1]);

            autoTable(doc, {
                startY: 20,
                head: detailHeaders,
                body: detailRows,
                theme: 'grid',
                styles: { fontSize: 7 }, // Letra más pequeña para que quepa todo
                headStyles: { fillColor: [55, 65, 81] }
            });
        }

        // Nota de auditoría
        const finalY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Este documento es un reporte técnico generado automáticamente por el sistema Centinela.", 105, finalY, { align: 'center' });
        doc.text("La información contenida aquí debe ser validada contra los formularios E-14 físicos proporcionados por la Registraduría.", 105, finalY + 5, { align: 'center' });

        // Guardar PDF
        doc.save(`Resumen_Electoral_${municipioNombre.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
        console.error("Error al generar PDF:", error);
    }
};
