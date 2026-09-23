import React, { useState, useEffect } from "react";
import { StorageUnit, Shelf, Box, StorageType, Rack, Drawer } from "../types.js";
import { X, Save, Server, Clipboard, Layers, Grid } from "lucide-react";

interface StorageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStorage: (unit: Omit<StorageUnit, "id"> & { id?: string }) => void;
  onSaveShelf: (
    shelf: Omit<Shelf, "id"> & {
      id?: string;
      defaultRackRows?: number | null;
      defaultRackCols?: number | null;
      defaultDrawerBoxCapacity?: number | null;
    }
  ) => void;
  onSaveRack: (
    rack: Omit<Rack, "id"> & {
      id?: string;
      defaultDrawerBoxCapacity?: number | null;
    }
  ) => void;
  onSaveDrawer: (drawer: Omit<Drawer, "id"> & { id?: string }) => void;
  onSaveBox: (box: Omit<Box, "id"> & { id?: string }) => void;
  mode: "storage" | "shelf" | "rack" | "drawer" | "box";
  editItem: StorageUnit | Shelf | Rack | Drawer | Box | null; // If editing
  storageUnits: StorageUnit[];
  shelves: Shelf[];
  racks: Rack[];
  drawers: Drawer[];
  boxes: Box[];
  preselectedStorageId?: string;
  preselectedShelfId?: string;
  preselectedRackId?: string;
  preselectedDrawerId?: string;
  preselectedDrawerSlot?: number | null;
}

export default function StorageFormModal({
  isOpen,
  onClose,
  onSaveStorage,
  onSaveShelf,
  onSaveRack,
  onSaveDrawer,
  onSaveBox,
  mode,
  editItem,
  storageUnits,
  shelves,
  racks,
  drawers,
  boxes,
  preselectedStorageId,
  preselectedShelfId,
  preselectedRackId,
  preselectedDrawerId,
  preselectedDrawerSlot
}: StorageFormModalProps) {
  // Common
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState("");

  // Storage Unit specific
  const [storageType, setStorageType] = useState<StorageType>("freezer");

  // Parents
  const [storageId, setStorageId] = useState("");
  const [shelfId, setShelfId] = useState("");
  const [rackId, setRackId] = useState("");
  const [drawerId, setDrawerId] = useState("");
  const [drawerSlot, setDrawerSlot] = useState<number | "">("");
  const [drawerBoxCapacity, setDrawerBoxCapacity] = useState<number>(4);

  // Grid specific (for boxes or racks)
  const [isGridLayout, setIsGridLayout] = useState(true);
  const [rows, setRows] = useState<number>(6);
  const [cols, setCols] = useState<number>(1);

  // Shelf Layout Specific
  const [isShelfGridLayout, setIsShelfGridLayout] = useState(false);
  const [shelfCols, setShelfCols] = useState<number>(6); // Default 6 racks across
  const [shelfRackRows, setShelfRackRows] = useState<number>(6);
  const [shelfRackCols, setShelfRackCols] = useState<number>(1);
  const [shelfDrawerBoxCapacity, setShelfDrawerBoxCapacity] = useState<number>(4);
  const [rackDrawerBoxCapacity, setRackDrawerBoxCapacity] = useState<number>(4);
  const [shelfCol, setShelfCol] = useState<number | "">(""); // column slot position on shelf

  // Load edit item values or defaults
  useEffect(() => {
    if (isOpen) {
      setValidationError("");
      if (editItem) {
        setName(editItem.name);
        if (mode === "storage") {
          setStorageType((editItem as StorageUnit).type);
        } else if (mode === "shelf") {
          const s = editItem as Shelf;
          setStorageId(s.storageId);
          if (s.cols) {
            setIsShelfGridLayout(true);
            setShelfCols(s.cols);
          } else {
            setIsShelfGridLayout(false);
            setShelfCols(6);
          }

          const firstRackOnShelf = racks.find(r => r.shelfId === s.id && !r.isArchived);
          setShelfRackRows(firstRackOnShelf?.rows || 6);
          setShelfRackCols(firstRackOnShelf?.cols || 1);
          const firstDrawerOnShelf = drawers.find(d => d.shelfId === s.id && !d.isArchived);
          setShelfDrawerBoxCapacity(firstDrawerOnShelf?.boxCapacity || 4);
        } else if (mode === "rack") {
          const r = editItem as Rack;
          setStorageId(r.storageId);
          setShelfId(r.shelfId);
          setShelfCol(r.shelfCol || "");
          if (r.rows && r.cols) {
            setIsGridLayout(true);
            setRows(r.rows);
            setCols(r.cols);
          } else {
            setIsGridLayout(false);
          }

          const firstDrawerOnRack = drawers.find(d => d.rackId === r.id && !d.isArchived);
          setRackDrawerBoxCapacity(firstDrawerOnRack?.boxCapacity || 4);
        } else if (mode === "drawer") {
          const d = editItem as Drawer;
          setStorageId(d.storageId);
          setShelfId(d.shelfId);
          setRackId(d.rackId);
          setDrawerBoxCapacity(Math.max(1, Math.min(500, Number(d.boxCapacity) || 4)));
        } else if (mode === "box") {
          const b = editItem as Box;
          setStorageId(b.storageId);
          setShelfId(b.shelfId);
          setRackId(b.rackId || "");
          setDrawerId(b.drawerId || "");
          setDrawerSlot(b.drawerSlot || "");
          setShelfCol(b.shelfCol || "");
          if (b.rows && b.cols) {
            setIsGridLayout(true);
            setRows(b.rows);
            setCols(b.cols);
          } else {
            setIsGridLayout(false);
          }
        }
      } else {
        setName("");
        setStorageType("freezer");
        setStorageId(preselectedStorageId || (storageUnits.filter(u => !u.isArchived)[0]?.id || ""));
        setShelfId(preselectedShelfId || "");
        setRackId(preselectedRackId || "");
        setDrawerId(preselectedDrawerId || "");
        setDrawerSlot(preselectedDrawerSlot || "");
        setDrawerBoxCapacity(4);
        setIsGridLayout(true);
        setRows(mode === "rack" ? 6 : 9);
        setCols(mode === "rack" ? 1 : 9);

        setIsShelfGridLayout(false);
        setShelfCols(6);
        setShelfRackRows(6);
        setShelfRackCols(1);
        setShelfDrawerBoxCapacity(4);
        setRackDrawerBoxCapacity(4);
        setShelfCol("");
      }
    }
  }, [isOpen, editItem, mode, preselectedStorageId, preselectedShelfId, preselectedRackId, preselectedDrawerId, preselectedDrawerSlot, storageUnits, racks, drawers]);

  // Handle cascading selections
  useEffect(() => {
    if ((mode === "shelf" || mode === "rack" || mode === "drawer" || mode === "box") && storageId && !editItem) {
      const validShelves = shelves.filter(s => s.storageId === storageId && !s.isArchived);
      if (validShelves.length > 0 && (!shelfId || !validShelves.some(vs => vs.id === shelfId))) {
        setShelfId(validShelves[0].id);
      }
    }
  }, [storageId, shelves, mode, editItem]);

  useEffect(() => {
    if ((mode === "drawer" || mode === "box") && shelfId && !editItem) {
      const validRacks = racks.filter(r => r.shelfId === shelfId && !r.isArchived);
      if (validRacks.length > 0 && (!rackId || !validRacks.some(vr => vr.id === rackId))) {
        // Auto select first rack for drawer mode, but for box mode it's optional
        if (mode === "drawer") {
          setRackId(validRacks[0].id);
        } else {
          setRackId("");
        }
      } else if (validRacks.length === 0) {
        setRackId("");
      }
    }
  }, [shelfId, racks, mode, editItem]);

  useEffect(() => {
    if (mode === "box" && rackId && !editItem) {
      const validDrawers = drawers.filter(d => d.rackId === rackId && !d.isArchived);
      if (validDrawers.length > 0 && (!drawerId || !validDrawers.some(vd => vd.id === drawerId))) {
        setDrawerId(""); // default to none/direct in rack
      } else if (validDrawers.length === 0) {
        setDrawerId("");
      }
    }
  }, [rackId, drawers, mode, editItem]);

  useEffect(() => {
    if (mode !== "box") return;
    if (!drawerId) {
      setDrawerSlot("");
      return;
    }

    const selectedDrawer = drawers.find(d => d.id === drawerId && !d.isArchived);
    const selectedDrawerCapacity = Math.max(1, Math.min(500, Number(selectedDrawer?.boxCapacity) || 4));
    if (!selectedDrawer) {
      setDrawerSlot("");
      return;
    }

    const occupiedSlots = new Set(
      boxes
        .filter(
          b =>
            !b.isArchived &&
            b.drawerId === drawerId &&
            b.id !== editItem?.id &&
            typeof b.drawerSlot === "number"
        )
        .map(b => b.drawerSlot as number)
    );

    const currentSlot = typeof drawerSlot === "number" ? drawerSlot : null;
    if (
      currentSlot &&
      currentSlot >= 1 &&
      currentSlot <= selectedDrawerCapacity &&
      !occupiedSlots.has(currentSlot)
    ) {
      return;
    }

    const firstFreeSlot = Array.from({ length: selectedDrawerCapacity }, (_, idx) => idx + 1)
      .find(slot => !occupiedSlots.has(slot));
    setDrawerSlot(firstFreeSlot || "");
  }, [mode, drawerId, drawers, boxes, editItem, drawerSlot]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      setValidationError("Name is required.");
      return;
    }

    if (mode === "storage") {
      onSaveStorage({
        id: editItem?.id,
        name: name.trim(),
        type: storageType,
        isArchived: false
      });
    } else if (mode === "shelf") {
      if (!storageId) {
        setValidationError("Please select a Storage Refrigerator/Freezer unit.");
        return;
      }
      const selectedShelf = shelves.find(s => s.id === shelfId && !s.isArchived);
      onSaveShelf({
        id: editItem?.id,
        storageId,
        name: name.trim(),
        cols: isShelfGridLayout ? Number(shelfCols) : null,
        defaultRackRows: isShelfGridLayout ? Number(shelfRackRows) : null,
        defaultRackCols: isShelfGridLayout ? Number(shelfRackCols) : null,
        defaultDrawerBoxCapacity: isShelfGridLayout ? Number(shelfDrawerBoxCapacity) : null,
        isArchived: false
      });
    } else if (mode === "rack") {
      if (!storageId) {
        setValidationError("Please select a Storage unit.");
        return;
      }
      if (!shelfId) {
        setValidationError("Please select a Shelf.");
        return;
      }

      let rowVal: number | null = null;
      let colVal: number | null = null;

      if (isGridLayout) {
        rowVal = Number(rows);
        colVal = Number(cols);
        if (isNaN(rowVal) || rowVal < 1 || rowVal > 20) {
          setValidationError("Row count must be a number between 1 and 20.");
          return;
        }
        if (isNaN(colVal) || colVal < 1 || colVal > 20) {
          setValidationError("Column count must be a number between 1 and 20.");
          return;
        }
      }

      const selectedShelf = shelves.find(s => s.id === shelfId && !s.isArchived);
      onSaveRack({
        id: editItem?.id,
        storageId,
        shelfId,
        name: name.trim(),
        rows: rowVal,
        cols: colVal,
        defaultDrawerBoxCapacity: Number(rackDrawerBoxCapacity),
        shelfCol: selectedShelf && selectedShelf.cols && shelfCol ? Number(shelfCol) : null,
        isArchived: false
      });
    } else if (mode === "drawer") {
      if (!storageId) {
        setValidationError("Please select a Storage unit.");
        return;
      }
      if (!shelfId) {
        setValidationError("Please select a Shelf.");
        return;
      }
      if (!rackId) {
        setValidationError("Please select a Rack.");
        return;
      }

      onSaveDrawer({
        id: editItem?.id,
        storageId,
        shelfId,
        rackId,
        name: name.trim(),
        boxCapacity: Number(drawerBoxCapacity),
        isArchived: false
      });
    } else if (mode === "box") {
      if (!storageId) {
        setValidationError("Please select a Storage unit.");
        return;
      }
      if (!shelfId) {
        setValidationError("Please select a Shelf.");
        return;
      }

      let rowVal: number | null = null;
      let colVal: number | null = null;

      if (isGridLayout) {
        rowVal = Number(rows);
        colVal = Number(cols);
        if (isNaN(rowVal) || rowVal < 1 || rowVal > 20) {
          setValidationError("Row count must be a number between 1 and 20.");
          return;
        }
        if (isNaN(colVal) || colVal < 1 || colVal > 20) {
          setValidationError("Column count must be a number between 1 and 20.");
          return;
        }
      }

      const selectedShelf = shelves.find(s => s.id === shelfId && !s.isArchived);
      const selectedDrawerForSave = drawerId ? drawers.find(d => d.id === drawerId && !d.isArchived) : undefined;
      const selectedDrawerForSaveCapacity = selectedDrawerForSave
        ? Math.max(1, Math.min(500, Number(selectedDrawerForSave.boxCapacity) || 4))
        : null;
      const occupiedSlotsForSave = selectedDrawerForSaveCapacity
        ? new Set(
            boxes
              .filter(
                b =>
                  !b.isArchived &&
                  b.drawerId === selectedDrawerForSave.id &&
                  b.id !== editItem?.id &&
                  typeof b.drawerSlot === "number"
              )
              .map(b => b.drawerSlot as number)
          )
        : new Set<number>();

      if (drawerId && selectedDrawerForSaveCapacity) {
        const chosenSlot = Number(drawerSlot);
        if (!chosenSlot || chosenSlot < 1 || chosenSlot > selectedDrawerForSaveCapacity) {
          setValidationError(`Please choose a drawer slot between 1 and ${selectedDrawerForSaveCapacity}.`);
          return;
        }
        if (occupiedSlotsForSave.has(chosenSlot)) {
          setValidationError(`Drawer slot ${chosenSlot} is already occupied.`);
          return;
        }
      }

      onSaveBox({
        id: editItem?.id,
        storageId,
        shelfId,
        rackId: rackId || null,
        drawerId: drawerId || null,
        drawerSlot: drawerId && selectedDrawerForSaveCapacity ? Number(drawerSlot) : null,
        name: name.trim(),
        rows: rowVal,
        cols: colVal,
        shelfCol: !rackId && selectedShelf && selectedShelf.cols && shelfCol ? Number(shelfCol) : null,
        isArchived: false
      });
    }
  };

  const getTitle = () => {
    if (editItem) {
      if (mode === "storage") return "Edit Storage Unit";
      if (mode === "shelf") return "Edit Shelf / Level";
      if (mode === "rack") return "Edit Rack / Frame";
      if (mode === "drawer") return "Edit Drawer / Section";
      return "Edit Box / Container";
    } else {
      if (mode === "storage") return "Add Storage Unit";
      if (mode === "shelf") return "Add Shelf / Level";
      if (mode === "rack") return "Add Rack / Frame";
      if (mode === "drawer") return "Add Drawer / Section";
      return "Add Box / Container";
    }
  };

  const getIcon = () => {
    if (mode === "box") return <Clipboard className="h-5 w-5 text-emerald-600" />;
    if (mode === "rack") return <Grid className="h-5 w-5 text-indigo-600" />;
    if (mode === "drawer") return <Layers className="h-5 w-5 text-teal-600" />;
    return <Server className="h-5 w-5 text-indigo-600" />;
  };

  const filteredShelves = shelves.filter(s => s.storageId === storageId && !s.isArchived);
  const filteredRacks = racks.filter(r => r.shelfId === shelfId && !r.isArchived);
  const filteredDrawers = drawers.filter(d => d.rackId === rackId && !d.isArchived);
  const selectedDrawerForBox = mode === "box" && drawerId
    ? drawers.find(d => d.id === drawerId && !d.isArchived)
    : undefined;
  const selectedDrawerCapacity = selectedDrawerForBox
    ? Math.max(1, Math.min(500, Number(selectedDrawerForBox.boxCapacity) || 4))
    : null;
  const occupiedDrawerSlots = selectedDrawerCapacity
    ? new Set(
        boxes
          .filter(
            b =>
              !b.isArchived &&
              b.drawerId === selectedDrawerForBox.id &&
              b.id !== editItem?.id &&
              typeof b.drawerSlot === "number"
          )
          .map(b => b.drawerSlot as number)
      )
    : new Set<number>();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            {getIcon()}
            <h3 className="text-lg font-semibold text-slate-900">{getTitle()}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {validationError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-100">
              {validationError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={
                mode === "storage"
                  ? "e.g. Refrigerator C, -80C Freezer A"
                  : mode === "shelf"
                  ? "e.g. Shelf 1, Middle Shelf"
                  : mode === "rack"
                  ? "e.g. Rack A, Grid Rack 1"
                  : mode === "drawer"
                  ? "e.g. Drawer 1, Top Drawer"
                  : "e.g. PCR Plasmid Box, CRISPR RNA Box"
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-hidden"
              autoFocus
            />
          </div>

          {mode === "storage" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Storage Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["freezer", "refrigerator", "room_temp"] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setStorageType(type)}
                    className={`py-2 px-2 border rounded-lg text-xs font-medium capitalize transition-all ${
                      storageType === type
                        ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {type === "room_temp" ? "Room Temp" : type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "shelf" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Parent Storage Unit *
                </label>
                <select
                  value={storageId}
                  onChange={e => setStorageId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
                >
                  <option value="">-- Select Unit --</option>
                  {storageUnits.filter(u => !u.isArchived).map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid-based Rack slots capacity for the level */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Define Shelf Rack Layout
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsShelfGridLayout(!isShelfGridLayout)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      isShelfGridLayout ? "bg-indigo-500" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        isShelfGridLayout ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {isShelfGridLayout ? (
                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-0.5">
                        Number of Rack columns across (1-20)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={shelfCols}
                        onChange={e => setShelfCols(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-0.5">
                          Default Rack Rows (1-20)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={shelfRackRows}
                          onChange={e => setShelfRackRows(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-0.5">
                          Default Rack Cols (1-20)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={shelfRackCols}
                          onChange={e => setShelfRackCols(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-0.5">
                        Boxes per Drawer Capacity (1-500)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={shelfDrawerBoxCapacity}
                        onChange={e => setShelfDrawerBoxCapacity(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      New rack slots will be auto-created alphabetically (A, B, C...). Each rack gets drawers based on row count, and each drawer stores only a capacity value (no empty boxes are created).
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Free-form list layout for racks on this shelf level.
                  </p>
                )}
              </div>
            </div>
          )}

          {mode === "rack" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Storage Unit *
                  </label>
                  <select
                    value={storageId}
                    onChange={e => {
                      setStorageId(e.target.value);
                      setShelfId("");
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  >
                    <option value="">-- Select Unit --</option>
                    {storageUnits.filter(u => !u.isArchived).map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Shelf Location *
                  </label>
                  <select
                    value={shelfId}
                    onChange={e => setShelfId(e.target.value)}
                    disabled={!storageId}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden disabled:opacity-60"
                  >
                    <option value="">-- Select Shelf --</option>
                    {filteredShelves.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Shelf Position for the Rack */}
              {(() => {
                const selectedShelf = shelves.find(s => s.id === shelfId && !s.isArchived);
                if (selectedShelf && selectedShelf.cols) {
                  return (
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Shelf Column Slot (1 to {selectedShelf.cols})
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2">
                        Specify which physical rack slot across the shelf this rack sits in.
                      </p>
                      <select
                        value={shelfCol}
                        onChange={e => setShelfCol(e.target.value ? Number(e.target.value) : "")}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm outline-hidden"
                      >
                        <option value="">-- No Specific Slot (Flow naturally) --</option>
                        {Array.from({ length: selectedShelf.cols }, (_, i) => i + 1).map(colNum => (
                          colNum && (
                            <option key={colNum} value={colNum}>
                              Slot {colNum}
                            </option>
                          )
                        ))}
                      </select>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Grid dimensions of the rack (for cryoboxes/drawers slots) */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Rack Slot Dimensions
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsGridLayout(!isGridLayout)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      isGridLayout ? "bg-indigo-500" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        isGridLayout ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {isGridLayout ? (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-0.5">
                        Rows of slots (1-20)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={rows}
                        onChange={e => setRows(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-0.5">
                        Cols of slots (1-20)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={cols}
                        onChange={e => setCols(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm"
                      />
                    </div>
                    <div className="col-span-2 text-center text-xs text-slate-500 font-mono py-1 bg-white border border-slate-100 rounded-md">
                      Total slots capacity: {rows * cols} boxes/drawers
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-0.5">
                        Boxes per Drawer Capacity (1-500)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={rackDrawerBoxCapacity}
                        onChange={e => setRackDrawerBoxCapacity(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Free-form list layout for boxes inside this rack frame.
                  </p>
                )}
              </div>
            </>
          )}

          {mode === "drawer" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Storage Unit *
                  </label>
                  <select
                    value={storageId}
                    onChange={e => {
                      setStorageId(e.target.value);
                      setShelfId("");
                      setRackId("");
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  >
                    <option value="">-- Select Unit --</option>
                    {storageUnits.filter(u => !u.isArchived).map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Shelf Location *
                  </label>
                  <select
                    value={shelfId}
                    onChange={e => {
                      setShelfId(e.target.value);
                      setRackId("");
                    }}
                    disabled={!storageId}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden disabled:opacity-60"
                  >
                    <option value="">-- Select Shelf --</option>
                    {filteredShelves.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Parent Rack *
                </label>
                <select
                  value={rackId}
                  onChange={e => setRackId(e.target.value)}
                  disabled={!shelfId}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden disabled:opacity-60"
                >
                  <option value="">-- Select Rack --</option>
                  {filteredRacks.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} {r.rows ? `(${r.rows}x${r.cols} slots)` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Number of Box Slots (1-500)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={drawerBoxCapacity}
                  onChange={e => setDrawerBoxCapacity(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            </div>
          )}

          {mode === "box" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Storage Unit *
                  </label>
                  <select
                    value={storageId}
                    onChange={e => {
                      setStorageId(e.target.value);
                      setShelfId("");
                      setRackId("");
                      setDrawerId("");
                      setDrawerSlot("");
                    }}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-white text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  >
                    <option value="">-- Select --</option>
                    {storageUnits.filter(u => !u.isArchived).map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Shelf Location *
                  </label>
                  <select
                    value={shelfId}
                    onChange={e => {
                      setShelfId(e.target.value);
                      setRackId("");
                      setDrawerId("");
                      setDrawerSlot("");
                    }}
                    disabled={!storageId}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-white text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden disabled:opacity-60"
                  >
                    <option value="">-- Select Shelf --</option>
                    {filteredShelves.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Rack (Optional)
                  </label>
                  <select
                    value={rackId}
                    onChange={e => {
                      setRackId(e.target.value);
                      setDrawerId("");
                      setDrawerSlot("");
                    }}
                    disabled={!shelfId}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-white text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden disabled:opacity-60"
                  >
                    <option value="">No Rack / Direct on Shelf</option>
                    {filteredRacks.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Drawer (Optional)
                  </label>
                  <select
                    value={drawerId}
                    onChange={e => {
                      setDrawerId(e.target.value);
                      setDrawerSlot("");
                    }}
                    disabled={!rackId}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-white text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden disabled:opacity-60"
                  >
                    <option value="">No Drawer / Direct in Rack</option>
                    {filteredDrawers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedDrawerForBox && selectedDrawerCapacity ? (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Drawer Position Slot (1 to {selectedDrawerCapacity})
                  </label>
                  <select
                    value={drawerSlot}
                    onChange={e => setDrawerSlot(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm outline-hidden"
                  >
                    <option value="">-- Select Available Slot --</option>
                    {Array.from({ length: selectedDrawerCapacity }, (_, idx) => idx + 1).map(slotNum => (
                      <option
                        key={slotNum}
                        value={slotNum}
                        disabled={occupiedDrawerSlots.has(slotNum)}
                      >
                        {occupiedDrawerSlots.has(slotNum) ? `Slot ${slotNum} (Occupied)` : `Slot ${slotNum} (Available)`}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {/* Optional Shelf Position for Direct Box */}
              {!rackId && (() => {
                const selectedShelf = shelves.find(s => s.id === shelfId && !s.isArchived);
                if (selectedShelf && selectedShelf.cols) {
                  return (
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Shelf Column Slot (1 to {selectedShelf.cols})
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2">
                        Specify which physical rack/box slot across the shelf this direct box sits in.
                      </p>
                      <select
                        value={shelfCol}
                        onChange={e => setShelfCol(e.target.value ? Number(e.target.value) : "")}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm outline-hidden"
                      >
                        <option value="">-- No Specific Slot (Flow naturally) --</option>
                        {Array.from({ length: selectedShelf.cols }, (_, i) => i + 1).map(colNum => (
                          colNum && (
                            <option key={colNum} value={colNum}>
                              Slot {colNum}
                            </option>
                          )
                        ))}
                      </select>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Grid Options for Box Layout */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Grid-Based Box Layout
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsGridLayout(!isGridLayout)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      isGridLayout ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        isGridLayout ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {isGridLayout ? (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-0.5">
                        Rows (1-20)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={rows}
                        onChange={e => setRows(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-0.5">
                        Columns (1-20)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={cols}
                        onChange={e => setCols(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-sm"
                      />
                    </div>
                    <div className="col-span-2 text-center text-xs text-slate-500 font-mono py-1 bg-white border border-slate-100 rounded-md">
                      Total capacity: {rows * cols} sample slots
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Samples inside a free-form container are stored in a simple, non-coordinate list view.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors bg-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            {editItem ? "Save Changes" : "Create Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
