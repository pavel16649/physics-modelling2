import React, {useState} from 'react';
import Plot from 'react-plotly.js';
import './main.css'
import wavelengthToRgb from "./WavelengthToRgb";

const sinc = (x) => {
    if (x == 0) {
        return 1;
    }

    return Math.sin(x) / x;
}

function NewtonRings() {
    const [radius, setRadius] = useState(0.001); // initial value in meters
    const [nLens, setNLens] = useState(1.5);
    const [nMedium, setNMedium] = useState(1.0);
    const [wavelength, setWavelength] = useState(600); // initial value in nanometers
    const [wavelengthDelta, setWavelengthDelta] = useState(10);
    const [data, setData] = useState([]);
    const [ heatmapData, setHeatmapData] = useState([]);
    const [layout, setLayout] = useState({});
    const [intensivity, setIntensivity] = useState(1);
    const [RMax, setRMax] = useState(0.000015);
    const heatmapSize = 1000;

    const [showModal, setShowModal] = useState(false);

    const IntensityFunction = (Rlens, n1, n2, lambda_m, lambda_m_delta, I0, r) => {
        const w_d_div_2c = Math.PI / lambda_m_delta;

        const R = Math.pow((n2-n1)/(n2+n1),2);
        const T = 4 * n1 * n2 / Math.pow(n2 + n1, 2);

        const delta_opt = r*r*n2/Rlens + lambda_m / 2;
        let I = I0 * R * (1 + T*T + 2*T*Math.cos(2*Math.PI/lambda_m * delta_opt));
        if (lambda_m_delta > 0) {
            if (delta_opt * lambda_m_delta > lambda_m * lambda_m) {
                return 0;
            }
            I = I0 * R * (1 + T*T + 2*T*Math.cos(2*Math.PI/lambda_m * delta_opt) * sinc(w_d_div_2c * delta_opt));
        }

        return I;
    }

    const handleCloseModal = () => {
        setShowModal(false);
    }
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        switch (name) {
            case 'radius':
                setRadius(parseFloat(value)); // meters
                break;
            case 'nLens':
                setNLens(parseFloat(value));
                break;
            case 'nMedium':
                setNMedium(parseFloat(value));
                break;
            case 'wavelength':
                setWavelength(parseFloat(value)); // nanometers
                break;
            case 'intensivity':
                setIntensivity(parseFloat(value));
                break;
            case  'wavelengthDelta':
                setWavelengthDelta(parseFloat(value));
                break;
            case 'RMax':
                setRMax(parseFloat(value));
                break;
            default:
                break;
        }
    };

    const handlePlot = (event) => {
        event.preventDefault();

        if (radius <= 0 || nLens <= 0 || nMedium <= 0 || wavelength <= 0 || RMax <= 0 || wavelengthDelta < 0) {
            setShowModal(true);
            return;
        }

        const Rlens = radius;
        const n1 = nLens;
        const n2 = nMedium;
        const lambda_m = wavelength * Math.pow(10, -9);
        const lambda_m_delta = wavelengthDelta * Math.pow(10, -9);
        const I0 = intensivity;

        const x_plot = [];
        const intensity_plot = [];

        for (let r = 0; r <= RMax; r += RMax / 10000) {
            x_plot.push(r);
            let I = IntensityFunction(Rlens, n1, n2, lambda_m, lambda_m_delta, I0, r);
            intensity_plot.push(I);
        }


        setHeatmapData(Array.from({ length: heatmapSize }, (_, i) =>
            Array.from({ length: heatmapSize }, (_, j) => {
                const x = (i - heatmapSize / 2) * RMax / (heatmapSize / 2);
                const y = (j - heatmapSize / 2) * RMax / (heatmapSize / 2);
                const r = Math.sqrt(x * x + y * y);
                return IntensityFunction(Rlens, n1, n2, lambda_m, lambda_m_delta, I0, r);
            })
        ));

        setData([{
            x: x_plot,
            y: intensity_plot,
            type: 'line'
        }]);

        setLayout({
            title: 'Зависимость интенсивности света от радиуса кольца',
            xaxis: { title: 'Радиус кольца, м' },
            yaxis: { title: 'Интенсивность света, Вт/м²' },
        });
    };

    return (
        <div className='body'>
            <h1>Кольца Ньютона</h1>
            <div className='inputs'>
                <div className='input'>
                    Радиус линзы, м:
                    <input type="number" name="radius" step="0.001" value={radius} onChange={handleInputChange}/>
                </div>
                <br/>
                <div className='input'>
                    Показатель преломления линзы:
                    <input type="number" name="nLens" step="0.1" value={nLens} onChange={handleInputChange}/>
                </div>
                <br/>
                <div className='input'>
                    Показатель преломления среды между ними:
                    <input type="number" name="nMedium" step="0.1" value={nMedium} onChange={handleInputChange}/>
                </div>
                <br/>
                <div className='input'>
                    Длина волны, нм:
                    <input type="number" name="wavelength" value={wavelength} onChange={handleInputChange}/>
                </div>
                <div className='input'>
                    Ширина диапазона длины волны, нм:
                    <input type="number" name="wavelengthDelta" value={wavelengthDelta} onChange={handleInputChange}/>
                </div>
                <br/>
                <div className='input'>
                    Интенсивность, Вт/м^2:
                    <input type="number" name="intensivity" value={intensivity} onChange={handleInputChange}/>
                </div>
                <br/>
                <div className='input'>
                    Максимальный r на графике, м:
                    <input type="number" name="RMax" value={RMax} onChange={handleInputChange}/>
                </div>
                <br/>
            </div>
            <div className='input'>
                <button type="button" onClick={handlePlot}>Построить график</button>
            </div>
            <Plot data={data} layout={layout}/>
            <Plot
                data={[
                    {
                        z: heatmapData,
                        type: 'heatmap',
                        colorscale: [[0, 'rgb(0, 0, 0)'], [1, wavelengthToRgb(wavelength)]],
                    },
                ]}
                layout={{
                    width: 500,
                    height: 500,
                    title: 'Картина интерференции',
                    xaxis: { visible: false },
                    yaxis: { visible: false },
                }}
            />
            {showModal && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Предупреждение</h2>
                        <p>Все значения должны быть больше нуля, кроме ширины диапазона, которая может быть больше или равна нулю</p>
                        <button onClick={handleCloseModal}>Попробую другие</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NewtonRings;
