import { useState } from "react";
import { sampleTables } from "@/services/mockData";
import { Database, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EmployeeDatabase() {
  const [tables, setTables] = useState(sampleTables.map((t) => ({ ...t, rows: [...t.rows.map((r) => [...r])] })));
  const [activeTable, setActiveTable] = useState(0);

  const table = tables[activeTable];

  const addRow = () => {
    setTables((prev) => {
      const next = [...prev];
      next[activeTable] = { ...next[activeTable], rows: [...next[activeTable].rows, next[activeTable].columns.map(() => "")] };
      return next;
    });
  };

  const deleteRow = (rowIdx: number) => {
    setTables((prev) => {
      const next = [...prev];
      next[activeTable] = { ...next[activeTable], rows: next[activeTable].rows.filter((_, i) => i !== rowIdx) };
      return next;
    });
  };

  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    setTables((prev) => {
      const next = [...prev];
      const rows = next[activeTable].rows.map((r) => [...r]);
      rows[rowIdx][colIdx] = value;
      next[activeTable] = { ...next[activeTable], rows };
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Database</h1>

      <div className="flex items-center gap-2">
        {tables.map((t, i) => (
          <button key={t.name} onClick={() => setActiveTable(i)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${i === activeTable ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            <Database className="h-3.5 w-3.5 inline mr-1.5" />{t.name}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">{table.name}</h3>
          <Button size="sm" onClick={addRow} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Row
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {table.columns.map((col) => (
                  <th key={col} className="text-left p-3 font-medium text-muted-foreground">{col}</th>
                ))}
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="p-2">
                      <Input value={cell} onChange={(e) => updateCell(ri, ci, e.target.value)}
                        className="bg-transparent border-transparent hover:border-border focus:border-primary h-8 text-sm" />
                    </td>
                  ))}
                  <td className="p-2">
                    <Button variant="ghost" size="icon" onClick={() => deleteRow(ri)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
