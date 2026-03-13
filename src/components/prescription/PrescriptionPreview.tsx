"use client";

import React from "react";
import { Modal } from "antd";
import dayjs from "dayjs";

interface PrescriptionData {
  // Customer info
  fullname?: string;
  dateofbirth?: Date | string;
  phone_number?: string;
  address?: string;
  gender?: number;

  // Prescription data
  examined_date?: Date | string;

  // Old prescription
  old_right_lk?: string;
  old_right_sphere?: string;
  old_right_cylinder?: string;
  old_right_axis?: number;
  old_right_addition?: string;
  old_right_tl?: string;
  old_left_lk?: string;
  old_left_sphere?: string;
  old_left_cylinder?: string;
  old_left_axis?: number;
  old_left_addition?: string;
  old_left_tl?: string;

  // Machine prescription
  machine_right_lk?: string;
  machine_right_sphere?: string;
  machine_right_cylinder?: string;
  machine_right_axis?: number;
  machine_right_addition?: string;
  machine_right_tl?: string;
  machine_left_lk?: string;
  machine_left_sphere?: string;
  machine_left_cylinder?: string;
  machine_left_axis?: number;
  machine_left_addition?: string;
  machine_left_tl?: string;

  // New prescription
  right_lk?: string;
  right_sphere?: string;
  right_cylinder?: string;
  right_axis?: number;
  right_addition?: string;
  right_tl?: string;
  right_pd?: string;
  left_lk?: string;
  left_sphere?: string;
  left_cylinder?: string;
  left_axis?: number;
  left_addition?: string;
  left_tl?: string;
  left_pd?: string;

  // Frame & Lens
  frame_name?: string;
  frame_price?: string;
  lense_name?: string;
  lense_price?: string;

  // Other
  re_examinated_date?: Date | string;
  description?: string;
  staff_name?: string;
}

interface PrescriptionPreviewProps {
  open: boolean;
  onClose: () => void;
  data: PrescriptionData;
}

export default function PrescriptionPreview({
  open,
  onClose,
  data,
}: PrescriptionPreviewProps) {
  const formatDate = (date?: Date | string) => {
    if (!date) return "";
    return dayjs(date).format("DD/MM/YYYY");
  };

  const formatGender = (gender?: number) => {
    return gender === 0 ? "Nam" : "Nữ";
  };

  const formatPrice = (price?: string) => {
    if (!price) return "";
    const num = parseFloat(price.replace(/,/g, ""));
    if (isNaN(num)) return price;
    return num.toLocaleString("vi-VN");
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      title="Xem trước đơn thuốc"
    >
      <div
        className="prescription-preview bg-white p-8"
        id="prescription-print"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold mb-2">
            Phiếu kiểm tra thị lực
          </h1>
          <div className="text-right text-sm italic">
            Ngày {formatDate(data.examined_date)}
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-6 space-y-2">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex">
              <span className="font-medium w-32">Họ và tên:</span>
              <span className="flex-1 border-b border-dotted border-gray-400 px-2">
                {data.fullname || ""}
              </span>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-1">
                <span className="font-medium w-32">Ngày sinh:</span>
                <span className="flex-1 border-b border-dotted border-gray-400 px-2">
                  {formatDate(data.dateofbirth)}
                </span>
              </div>
              <div className="flex flex-1">
                <span className="font-medium w-24">Giới tính:</span>
                <span className="flex-1 border-b border-dotted border-gray-400 px-2">
                  {formatGender(data.gender)}
                </span>
              </div>
            </div>
            <div className="flex">
              <span className="font-medium w-32">Số điện thoại:</span>
              <span className="flex-1 border-b border-dotted border-gray-400 px-2">
                {data.phone_number || ""}
              </span>
            </div>
          </div>
        </div>

        {/* Old Prescription Section */}
        <div className="mb-6">
          <h3 className="font-bold text-base mb-3 underline italic">
            ĐỘ KÍNH CŨ:
          </h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 text-left py-2 px-3 font-semibold">
                  Mắt
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  LK
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  S
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  C
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  A
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  ADD
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  TL
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 py-2 px-3 font-medium">
                  Phải
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.old_right_lk || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.old_right_sphere || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.old_right_cylinder || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.old_right_axis || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.old_right_addition || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.old_right_tl || ""}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 py-2 px-3 font-medium">
                  Trái
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.old_left_lk || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.old_left_sphere || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.old_left_cylinder || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.old_left_axis || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.old_left_addition || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.old_left_tl || ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Machine Prescription Section */}
        <div className="mb-6">
          <h3 className="font-bold text-base mb-3 underline italic">
            ĐỘ MÁY ĐO:
          </h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 text-left py-2 px-3 font-semibold">
                  Mắt
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  LK
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  S
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  C
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  A
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  ADD
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  TL
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 py-2 px-3 font-medium">
                  Phải
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.machine_right_lk || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.machine_right_sphere || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.machine_right_cylinder || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.machine_right_axis || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.machine_right_addition || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.machine_right_tl || ""}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 py-2 px-3 font-medium">
                  Trái
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.machine_left_lk || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.machine_left_sphere || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.machine_left_cylinder || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.machine_left_axis || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.machine_left_addition || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.machine_left_tl || ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* New Prescription Section */}
        <div className="mb-6">
          <h3 className="font-bold text-base mb-3 underline italic">
            ĐỘ KÍNH MỚI:
          </h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 text-left py-2 px-3 font-semibold">
                  Mắt
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  LK
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  S
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  C
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  A
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  ADD
                </th>
                <th className="border border-gray-300 text-center py-2 px-3 font-semibold">
                  TL
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 py-2 px-3 font-medium">
                  Phải
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.right_lk || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.right_sphere || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.right_cylinder || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.right_axis || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.right_addition || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.right_tl || ""}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 py-2 px-3 font-medium">
                  Trái
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.left_lk || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.left_sphere || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.left_cylinder || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.left_axis || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.left_addition || ""}
                </td>
                <td className="border border-gray-300 text-center py-2 px-3">
                  {data.left_tl || ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PD Section */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="flex">
            <span className="font-medium">KCĐT: MT</span>
            <span className="flex-1 border-b border-dotted border-gray-400 px-2 ml-2">
              {data.right_pd || ""}
            </span>
          </div>
          <div className="flex">
            <span className="font-medium">KCĐT: MP</span>
            <span className="flex-1 border-b border-dotted border-gray-400 px-2 ml-2">
              {data.left_pd || ""}
            </span>
          </div>
        </div>

        {/* Frame & Lens Section */}
        <div className="mb-6 space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex">
              <span className="font-medium w-24">Tên gọng:</span>
              <span className="flex-1 border-b border-dotted border-gray-400 px-2">
                {data.frame_name || ""}
              </span>
            </div>
            <div className="flex">
              <span className="font-medium w-24">Giá gọng:</span>
              <span className="flex-1 border-b border-dotted border-gray-400 px-2">
                {formatPrice(data.frame_price)}{" "}
                {data.frame_price ? "(VNĐ)" : ""}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex">
              <span className="font-medium w-24">Tên tròng:</span>
              <span className="flex-1 border-b border-dotted border-gray-400 px-2">
                {data.lense_name || ""}
              </span>
            </div>
            <div className="flex">
              <span className="font-medium w-24">Giá tròng:</span>
              <span className="flex-1 border-b border-dotted border-gray-400 px-2">
                {formatPrice(data.lense_price)}{" "}
                {data.lense_price ? "(VNĐ)" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Re-examination Date */}
        <div className="mb-6">
          <div className="flex">
            <span className="font-medium">Ngày tái khám:</span>
            <span className="flex-1 border-b border-dotted border-gray-400 px-2 ml-2">
              {formatDate(data.re_examinated_date)}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <div className="flex">
            <span className="font-medium">Ghi chú của KTVKTKX:</span>
            <span className="flex-1 border-b border-dotted border-gray-400 px-2 ml-2">
              {data.description || ""}
            </span>
          </div>
        </div>

        {/* Staff Name */}
        <div className="mb-6">
          <div className="flex justify-end">
            <span className="font-medium">Tên KTVKTKX:</span>
            <span className="border-b border-dotted border-gray-400 px-2 ml-2 w-64 text-center">
              {data.staff_name || ""}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
