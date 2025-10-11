const SeaScriptInterpreter = () => {
  const [code, setCode] = React.useState(`🐴➡️5
🐴🐴➡️10
🐴🐴🐴➡️🐴➕🐴🐴
💬🐴🐴🐴

🔁🐴🐴🐴
  💬🌊
🔚

❓🐴➡️🐴🐴
  💬✨
🔚`);
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');

  const interpret = (codeToRun) => {
    const lines = codeToRun.trim().split('\n');
    const vars = {};
    let outputLog = [];
    let i = 0;
    const maxIterations = 10000;
    let totalOperations = 0;

    const findMatchingEnd = (startIndex) => {
        let openBlocks = 1;
        for (let j = startIndex + 1; j < lines.length; j++) {
            const line = lines[j].trim();
            if (line.startsWith('🔁') || line.startsWith('❓')) {
                openBlocks++;
            } else if (line.startsWith('🔚')) {
                openBlocks--;
                if (openBlocks === 0) {
                    return j;
                }
            }
        }
        return -1; // Not found
    };


    const executeBlock = (start, end) => {
        let local_i = start;
        while (local_i < end) {
            totalOperations++;
            if (totalOperations > maxIterations) {
                throw new Error("Infinite loop detected! Halting execution.");
            }
            
            const line = lines[local_i].trim();
            local_i++;

            if (!line) {
              continue;
            }

            // Variable assignment: 🐴...➡️value
            if (line.includes('➡️') && !line.startsWith('❓')) {
              const [varPart, valuePart] = line.split('➡️');
              const varName = varPart.trim();
              if ((varName.match(/🐴/g) || []).length === 0) {
                throw new Error(`Invalid variable name: ${varName}`);
              }
              const seahorseCount = (varName.match(/🐴/g) || []).length;
              const valueStr = valuePart.trim();

              if (/^\d+$/.test(valueStr)) {
                vars[seahorseCount] = parseInt(valueStr, 10);
              } else if (valueStr.includes('🐴')) {
                const expr = valueStr.replace(/\s+/g, '');
                let processedExpr = expr.replace(/🐴+/g, (match) => {
                    const count = match.length;
                    if (vars[count] === undefined) {
                        throw new Error(`Variable ${'🐴'.repeat(count)} is not defined.`);
                    }
                    return vars[count];
                });
                
                // Super simple eval, only allows numbers and operators
                if (!/^[\d\.\+\-\*\/()\s]+$/.test(processedExpr)) {
                    throw new Error(`Invalid expression: ${processedExpr}`);
                }
                vars[seahorseCount] = new Function('return ' + processedExpr.replace('➕','+').replace('➖','-').replace('✖️','*'))();

              } else {
                 throw new Error(`Invalid value for assignment: ${valueStr}`);
              }
            }
            // Print: 💬🐴...
            else if (line.startsWith('💬')) {
                const content = line.slice(1).trim();
                if (content.includes('🐴')) {
                    const seahorseCount = (content.match(/🐴/g) || []).length;
                    if(vars[seahorseCount] === undefined) throw new Error(`Trying to print an unassigned variable: ${'🐴'.repeat(seahorseCount)}`);
                    outputLog.push(vars[seahorseCount]);
                } else {
                    outputLog.push(content);
                }
            }
            // Loop: 🔁🐴...
            else if (line.startsWith('🔁')) {
                const seahorseCount = (line.match(/🐴/g) || []).length;
                if (vars[seahorseCount] === undefined) throw new Error(`Loop variable ${'🐴'.repeat(seahorseCount)} is not defined.`);
                const iterations = vars[seahorseCount] || 0;
                const loopStart = local_i;
                const loopEnd = findMatchingEnd(local_i - 1);

                if (loopEnd === -1) throw new Error("Loop missing '🔚'.");

                for (let loop = 0; loop < iterations; loop++) {
                    totalOperations++;
                    if (totalOperations > maxIterations) {
                       throw new Error("Infinite loop detected! Halting execution.");
                    }
                    executeBlock(loopStart, loopEnd);
                }
                local_i = loopEnd + 1;
            }
            // Conditional: ❓🐴...➡️🐴...
            else if (line.startsWith('❓')) {
                const condition = line.slice(1).trim();
                const parts = condition.split('➡️');
                if (parts.length !== 2) throw new Error(`Invalid conditional syntax: ${line}`);
                const left = (parts[0].match(/🐴/g) || []).length;
                const right = (parts[1].match(/🐴/g) || []).length;
                
                if (vars[left] === undefined) throw new Error(`Conditional variable ${'🐴'.repeat(left)} is not defined.`);
                if (vars[right] === undefined) throw new Error(`Conditional variable ${'🐴'.repeat(right)} is not defined.`);

                const ifEnd = findMatchingEnd(local_i - 1);
                if (ifEnd === -1) throw new Error("Conditional missing '🔚'.");
                
                if (vars[left] === vars[right]) {
                    executeBlock(local_i, ifEnd);
                }
                local_i = ifEnd + 1;
            } else if (line.startsWith('🔚')) {
                // End blocks are handled by loops/conditionals
            } else {
                if (line) throw new Error(`Unknown command: ${line}`);
            }
        }
    }

    try {
        executeBlock(0, lines.length);
        return outputLog.join('\n');
    } catch (err) {
        throw new Error('SeaScript Error: ' + err.message);
    }
  };


  const runCode = () => {
    setError('');
    setOutput('');
    
    try {
      const result = interpret(code);
      setOutput(result);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-500 p-4 sm:p-8 text-white font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-4">
            <img src="seahorse_logo.png" alt="SeaScript Logo" className="h-12"/>
            SeaScript
          </h1>
          <p className="text-cyan-100 text-lg">The Seahorse Programming Language</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Language Reference</h2>
          <div className="space-y-3 text-sm">
            <p><span className="font-bold text-lg">🐴 Variables:</span> Use seahorses to name variables. <code className="bg-black/20 px-2 py-1 rounded-md">🐴</code> is var1, <code className="bg-black/20 px-2 py-1 rounded-md">🐴🐴</code> is var2, etc.</p>
            <p><span className="font-bold text-lg">➡️ Assignment:</span> <code className="bg-black/20 px-2 py-1 rounded-md">🐴➡️5</code> sets var1 to 5.</p>
            <p><span className="font-bold text-lg">💬 Print:</span> <code className="bg-black/20 px-2 py-1 rounded-md">💬🐴</code> prints var1's value. Can also print strings: <code className="bg-black/20 px-2 py-1 rounded-md">💬Hello!</code></p>
            <p><span className="font-bold text-lg">➕➖✖️ Math:</span> <code className="bg-black/20 px-2 py-1 rounded-md">🐴🐴🐴➡️🐴➕🐴🐴</code> assigns the sum of var1 and var2 to var3.</p>
            <p><span className="font-bold text-lg">🔁 Loop:</span> <code className="bg-black/20 px-2 py-1 rounded-md">🔁🐴 ... 🔚</code> loops N times, where N is the value of var1.</p>
            <p><span className="font-bold text-lg">❓ If equals:</span> <code className="bg-black/20 px-2 py-1 rounded-md">❓🐴➡️🐴🐴 ... 🔚</code> executes code inside if var1 equals var2.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-3">Code Editor</h2>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-96 p-4 font-mono text-lg bg-black/30 text-cyan-200 border-2 border-cyan-300 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400"
              spellCheck="false"
              autoCapitalize="off"
              autoCorrect="off"
            />
            <button
              onClick={runCode}
              className="mt-4 w-full bg-cyan-400 hover:bg-cyan-500 text-blue-900 font-bold py-3 px-6 rounded-lg text-lg transition-all shadow-lg transform active:scale-95"
            >
              🌊 Run SeaScript
            </button>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">Output</h2>
            <div className="bg-gray-900/70 text-green-400 font-mono p-4 h-96 rounded-lg overflow-auto border-2 border-cyan-300">
              {error ? (
                <div className="text-red-400 whitespace-pre-wrap">{error}</div>
              ) : (
                <pre className="whitespace-pre-wrap">{output || <span className="text-gray-500">// Output will appear here...</span>}</pre>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-lg shadow-2xl p-6">
          <h3 className="text-xl font-bold mb-3">Example Programs</h3>
          <div className="space-y-2">
            <button
              onClick={() => setCode(`🐴➡️3\n🐴🐴➡️7\n🐴🐴🐴➡️🐴➕🐴🐴\n💬🐴🐴🐴`)}
              className="w-full text-left bg-white/10 hover:bg-white/20 p-3 rounded transition-colors"
            >
              <span className="font-bold">Addition:</span> Add two numbers
            </button>
            <button
              onClick={() => setCode(`🐴➡️5\n🔁🐴\n  💬🌊\n🔚`)}
              className="w-full text-left bg-white/10 hover:bg-white/20 p-3 rounded transition-colors"
            >
              <span className="font-bold">Loop:</span> Print waves 5 times
            </button>
            <button
              onClick={() => setCode(`🐴➡️10\n🐴🐴➡️10\n❓🐴➡️🐴🐴\n  💬They match! ✨\n🔚`)}
              className="w-full text-left bg-white/10 hover:bg-white/20 p-3 rounded transition-colors"
            >
              <span className="font-bold">Conditional:</span> Compare two values
            </button>
          </div>
        </div>
        
        <footer className="text-center text-cyan-200/50 mt-8 text-sm">
            <p>Created with the AI web editor.</p>
        </footer>
        
      </div>
    </div>
  );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<SeaScriptInterpreter />);

