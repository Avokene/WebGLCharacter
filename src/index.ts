const canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
let gl = canvas.getContext('webgl')!;

if (!gl) {
    alert('WebGL not supported, falling back on experimental-webgl');
    gl = canvas.getContext('experimental-webgl');
}

if (!gl) {
    alert('Your browser does not support WebGL');
}

// 셰이더 프로그램 생성 (버텍스 셰이더와 프래그먼트 셰이더)
const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
`;

const fragmentShaderSource = `
    void main(void) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red color
    }
`;

// 셰이더 컴파일 함수
function compileShader(gl: WebGLRenderingContext, source: string, type: number) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
}

gl.useProgram(shaderProgram);

// 버퍼 생성 및 데이터 로드
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const positions = [
    -0.5, -0.5,
     0.5, -0.5,
    -0.5,  0.5,
     0.5,  0.5,
];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
gl.enableVertexAttribArray(vertexPosition);
gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);

// 행렬 생성 (투영 행렬 및 모델-뷰 행렬)
const modelViewMatrix = mat4.create();
const projectionMatrix = mat4.create();

mat4.perspective(projectionMatrix,
    45 * Math.PI / 180,   // FOV
    gl.canvas.width / gl.canvas.height,
    0.1,                  // Near clipping plane
    100.0);               // Far clipping plane

mat4.translate(modelViewMatrix,    // destination matrix
    modelViewMatrix,    // matrix to translate
    [-0.0, 0.0, -6.0]); // amount to translate

gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'), false, modelViewMatrix);
gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'), false, projectionMatrix);

// 렌더링 루프
function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the square
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // 애니메이션 프레임 요청
    requestAnimationFrame(render);
}

requestAnimationFrame(render);

// 키보드 이벤트 리스너 추가 (캐릭터 이동 처리)
window.addEventListener('keydown', (event) => {
    const key = event.key;
    const moveSpeed = 0.1;

    switch (key) {
        case 'ArrowUp':
            mat4.translate(modelViewMatrix, modelViewMatrix, [0, moveSpeed, 0]);
            break;
        case 'ArrowDown':
            mat4.translate(modelViewMatrix, modelViewMatrix, [0, -moveSpeed, 0]);
            break;
        case 'ArrowLeft':
            mat4.translate(modelViewMatrix, modelViewMatrix, [-moveSpeed, 0, 0]);
            break;
        case 'ArrowRight':
            mat4.translate(modelViewMatrix, modelViewMatrix, [moveSpeed, 0, 0]);
            break;
    }

    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'), false, modelViewMatrix);
});

// WebGL 코드 (위에서 제공한 샘플 코드 삽입)
